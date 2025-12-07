import {
  View,
  Text,
  useColorScheme,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Pressable,
  Platform,
  ScrollView,
} from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { validateInputs } from '@/lib/validateInputs'
import {
  appendForm,
  formatDate,
  formatDateToDayMonthYY,
  getDeviceWidth,
} from '@/lib/helpers'
import debounce from 'lodash/debounce'
import api from '@/lib/api'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import AcademicStore, { AcademicLevel } from '@/store/school/Academic'
import DepartmentStore, { Department } from '@/store/school/Department'
import {
  BioUserSchoolInfo,
  BioUserSchoolInfoEmpty,
  BioUserSchoolInfoStore,
} from '@/store/user/BioUserSchoolInfo'
import CountryStore from '@/store/place/CountryOrigin'
import SchoolStore, { School } from '@/store/school/School'
import { Area } from '@/store/place/Area'
import StateStore from '@/store/place/StateOrigin'
import AreaStore from '@/store/place/AreaOrigin'
import CustomDropdown from '@/components/General/CustomDropdown'
import { RadioButton } from '@/components/General/RadioButton'
import InputField from '@/components/General/InputField'
import { Calendar } from 'lucide-react-native'
import dayjs from 'dayjs'
import PopupCalendar from '@/components/General/PopupCalendar'
import CustomBtn from '@/components/General/CustomBtn'

interface MaxLevels {
  level: number
  isActive: boolean
}

export default function VerificationEducationHistorySettings() {
  const { user, bioUserSchoolInfo } = AuthStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const width = getDeviceWidth()
  const {
    toggleActive,
    getAcademics,
    academicResults,
    activeLevel,
    setActiveLevel,
  } = AcademicStore()
  const {
    setBioUserPastSchoolForm,
    updateBioUserSchoolInfo,
    bioUserSchoolForm,
    bioUserPastSchoolForm,
    loading,
    pastSchools,
  } = BioUserSchoolInfoStore()
  const { searchedSchoolResult, loadingSchool, searchSchool } = SchoolStore()
  const { searchedDepartments, searchDepartment } = DepartmentStore()
  const { states, getStates } = StateStore()
  const { area, getArea } = AreaStore()
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [isDepartmentList, setDepartmentList] = useState(false)
  const [isFacultyList, setFacultyList] = useState(false)
  const [allowAdvance, setAllowAdvance] = useState(false)
  const [isHistoryEdit, setHistoryEdit] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const { countries, getCountries } = CountryStore()
  const [isCountryList, setCountryList] = useState(false)
  const [isSchoolList, setSchoolList] = useState(false)
  const [place, setPlace] = useState('')
  const [schoolText, setSchoolText] = useState('')
  const [facultyText, setFacultyText] = useState('')
  const [departmentText, setDepartmentText] = useState('')
  const url = '/users/bio-user/school/'
  const [showPickerEntry, setShowPickerEntry] = useState(false)
  const [showPickerExit, setShowPickerExit] = useState(false)
  const [selectedDateEntry, setSelectedDateEntry] = useState<Date | null>(null)
  const [selectedDateExit, setSelectedDateExit] = useState<Date | null>(null)
  const [isEditingSchool, setIsEditingSchool] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [maxLevels, setMaxLevel] = useState<MaxLevels[]>([])
  const [schoolName, setSchoolName] = useState('')
  const [schoolDepartment, setSchoolDepartment] = useState('')
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [calendarVisible1, setCalendarVisible1] = useState(false)

  const [isNew, setIsNew] = useState(false)
  const [added, setAdded] = useState(false)
  const [loadingPlace, setLoadingPlace] = useState(false)
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [loadingFaculties, setLoadingFaculties] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`
      )
    }
  }, [])

  useEffect(() => {
    if (bioUserSchoolInfo) {
      BioUserSchoolInfoStore.setState({
        bioUserSchoolForm: bioUserSchoolInfo,
      })
    }
    setHistoryEdit(true)
  }, [bioUserSchoolInfo])

  const handleSearchSchool = (value: string) => {
    if (!value) {
      SchoolStore.setState({ searchedSchoolResult: [] })
      return
    }
    setSchoolName(value)
    searchSchool(
      `/schools/?name=${value}&state=${bioUserSchoolForm.schoolState.trim()}`
    )
  }

  const handleSearchDepartment = (value: string) => {
    if (!value) {
      DepartmentStore.setState({ searchedDepartments: [] })
      return
    }
    setSchoolDepartment(value)
    searchDepartment(
      `/departments/?name=${value}&schoolId=${bioUserSchoolForm.schoolId}`
    )
  }

  const selectCountry = (country: Area) => {
    setBioUserPastSchoolForm('schoolContinent', country.continent)
    setBioUserPastSchoolForm('schoolCountry', country.country)
    setBioUserPastSchoolForm('schoolCountryFlag', String(country.countryFlag))
    setBioUserPastSchoolForm('schoolCountrySymbol', country.countrySymbol)
    setCountryList(false)
    StateStore.setState({ states: [] })
    AreaStore.setState({ area: [] })
    AcademicStore.setState({ academicResults: [] })
    getLevels(country.country)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
  }

  const selectState = (state: Area) => {
    setBioUserPastSchoolForm('schoolState', state.state)
    setBioUserPastSchoolForm('schoolArea', '')
    AreaStore.setState({ area: [] })
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
  }

  const selectArea = (area: Area) => {
    setBioUserPastSchoolForm('schoolArea', area.area)
    setBioUserPastSchoolForm('schoolPlaceId', area.id)
  }

  const selectSchool = (item: School) => {
    setIsNew(false)
    setBioUserPastSchoolForm('schoolName', item.name)
    setBioUserPastSchoolForm('schoolId', item._id)
    setBioUserPastSchoolForm('schoolPicture', String(item.media))
    setBioUserPastSchoolForm('schoolLogo', String(item.logo))
    setSchoolName('')
    SchoolStore.setState({ searchedSchoolResult: [] })
  }

  const selectDepartment = (item: Department) => {
    setBioUserPastSchoolForm('schoolDepartment', item.name)
    setBioUserPastSchoolForm('schoolDepartmentUsername', item.username)
    setBioUserPastSchoolForm('schoolDepartmentId', item._id)
    setSchoolDepartment('')
    DepartmentStore.setState({ searchedDepartments: [] })
  }

  const setSchool = () => {
    setIsNew(true)
    setBioUserPastSchoolForm('schoolName', schoolName)
    setSchoolName('')
    SchoolStore.setState({ searchedSchoolResult: [] })
  }

  const setDepartment = () => {
    setSchoolDepartment('')
    setBioUserPastSchoolForm('schoolDepartment', schoolDepartment)
    DepartmentStore.setState({ searchedDepartments: [] })
  }

  const selectLevel = (
    index: number,
    item: AcademicLevel,
    clicked: boolean = false
  ) => {
    const maxLevels: MaxLevels[] = []
    for (let i = 0; i < item.maxLevel; i++) {
      const maxLevel = {
        level: i,
        isActive: false,
      }
      maxLevels.push(maxLevel)
    }
    setBioUserPastSchoolForm('schoolAcademicLevel', item)
    setMaxLevel(() => [...maxLevels])
    if (
      !item.levelName.includes('Primary') &&
      !item.levelName.includes('Secondary')
    ) {
      setIsAdvanced(true)
    } else {
      setIsAdvanced(false)
    }
    toggleActive(index)
    if (clicked) {
      // clearSchool()
    }
  }

  const getLevels = async (country: string) => {
    getAcademics(
      `/academic-levels/?inSchool=${bioUserPastSchoolForm.inSchool}&country=${country}`
    )
  }

  const addSchool = () => {
    if (isEditingSchool) {
      BioUserSchoolInfoStore.setState((prev) => {
        const newItems = prev.pastSchools.map((item, index) =>
          index === editIndex ? bioUserPastSchoolForm : item
        )
        return {
          pastSchools: newItems,
        }
      })
      setAdded(true)
    } else {
      const inputsToValidate = [
        {
          name: 'isNew',
          value: isNew,
          rules: { blank: true },
          field: 'Is school recorded',
        },
        {
          name: 'schoolArea',
          value: bioUserPastSchoolForm.schoolArea,
          rules: { blank: true, minLength: 2 },
          field: 'School Area',
        },
        {
          name: 'schoolState',
          value: bioUserPastSchoolForm.schoolState,
          rules: { blank: true },
          field: 'School State',
        },
        {
          name: 'schoolCountry',
          value: bioUserPastSchoolForm.schoolCountry,
          rules: { blank: true, minLength: 2 },
          field: 'School Country',
        },
        {
          name: 'schoolContinent',
          value: bioUserPastSchoolForm.schoolContinent,
          rules: { blank: true },
          field: 'School Continent',
        },
        {
          name: 'schoolCountryFlag',
          value: bioUserPastSchoolForm.schoolCountryFlag,
          rules: { blank: true },
          field: 'School Country Flag',
        },
        {
          name: 'schoolAcademicLevel',
          value: bioUserPastSchoolForm.schoolAcademicLevel,
          rules: { blank: false },
          field: 'Academic Level',
        },
        {
          name: 'schoolName',
          value: bioUserPastSchoolForm.schoolName.trim(),
          rules: { blank: false, minLength: 2 },
          field: 'School Name',
        },
        {
          name: 'schoolLogo',
          value: bioUserPastSchoolForm.schoolLogo,
          rules: { blank: true },
          field: 'School Name',
        },
        {
          name: 'schoolDepartmentId',
          value: bioUserPastSchoolForm.schoolDepartmentId.trim(),
          rules: { blank: true },
          field: 'Department Name',
        },
        {
          name: 'department',
          value: bioUserPastSchoolForm.schoolDepartment.trim(),
          rules: { blank: isAdvanced ? false : true },
          field: 'Department Name',
        },
        {
          name: 'departmentUsername',
          value: bioUserPastSchoolForm.schoolDepartmentUsername,
          rules: { blank: true },
          field: 'Department Username',
        },
        {
          name: 'admittedAt',
          value: bioUserPastSchoolForm.admittedAt,
          rules: { blank: false, minLength: 2 },
          field: 'Entry Date',
        },
        {
          name: 'graduatedAt',
          value: bioUserPastSchoolForm.graduatedAt,
          rules: { blank: false, minLength: 2 },
          field: 'Exit Date',
        },
      ]

      const { messages } = validateInputs(inputsToValidate)
      const getFirstNonEmptyMessage = (
        messages: Record<string, string>
      ): string | null => {
        for (const key in messages) {
          if (messages[key].trim() !== '') {
            return messages[key]
          }
        }
        return null
      }

      const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
      if (firstNonEmptyMessage) {
        setMessage(firstNonEmptyMessage, false)
        return
      }
      BioUserSchoolInfoStore.setState((prev) => {
        return {
          pastSchools: [...prev.pastSchools, bioUserPastSchoolForm],
        }
      })
      setAdded(true)
    }

    AcademicStore.getState().resetForm()
    setActiveLevel({
      level: 0,
      levelName: '',
      maxLevelName: '',
      subsectionDegree: '',
      degree: '',
    })
    resetSchool()
    setIsAdvanced(false)
    setEditIndex(null)
  }

  const resetSchool = () => {
    setCountryList(false)
    BioUserSchoolInfoStore.setState({
      bioUserPastSchoolForm: BioUserSchoolInfoEmpty,
    })

    setAdded(false)
  }

  const tempDelete = (indexToRemove: number) => {
    BioUserSchoolInfoStore.setState((prev) => {
      const newItems = prev.pastSchools.filter(
        (_, index) => index !== indexToRemove
      )
      return {
        pastSchools: newItems,
      }
    })
    setAdded(true)
  }

  const tempEdit = (index: number, item: BioUserSchoolInfo) => {
    if (
      !item.schoolAcademicLevel.levelName.includes(`Primary`) &&
      !item.schoolAcademicLevel.levelName.includes(`Secondary`)
    ) {
      setAllowAdvance(false)
      setIsAdvanced(true)
    }

    getAcademics(
      `/places/academic-levels/?country=${item.schoolCountry}&inSchool=true`
    )

    setEditIndex(index)
    setIsEditingSchool(true)
    BioUserSchoolInfoStore.setState({ bioUserPastSchoolForm: item })
  }

  // const areAllFieldsFilled = (): boolean => {
  //   const form = formHistory
  //   return Object.entries(form).every(([key, value]) => {
  //     if (typeof value === 'string') {
  //       return value.trim() !== ''
  //     }
  //     if (typeof value === 'number') {
  //       return value !== null && !isNaN(value)
  //     }
  //     if (typeof value === 'boolean') {
  //       return true
  //     }
  //     return value !== null && value !== undefined
  //   })
  // }

  // const reinitializeForm = () => {
  //   setHistoryEdit(false)
  //   setFormHistory({
  //     schoolTempCertificate: '',
  //     schoolCertificate: '',
  //     schoolCountryFlag: '',
  //     schoolContinent: '',
  //     schoolCountry: '',
  //     schoolState: '',
  //     schoolArea: '',
  //     schoolPlaceId: '',
  //     schoolName: '',
  //     schoolUsername: '',
  //     schoolLogo: '',
  //     schoolId: '',
  //     facultyUsername: '',
  //     faculty: '',
  //     departmentUsername: '',
  //     department: '',
  //     academicLevelName: '',
  //     degree: '',
  //     subsectionDegree: '',
  //     academicLevel: 0,
  //     entryYear: null,
  //     exitYear: null,
  //     certificate: '',
  //     isNew: false,
  //   })
  //   AcademicStore.setState({
  //     activeLevel: {
  //       levelName: '',
  //       maxLevelName: '',
  //       degree: '',
  //       subsectionDegree: '',
  //       level: 0,
  //     },
  //   })
  //   resetSchool()
  //   setFaculty({
  //     name: '',
  //     _id: '',
  //     schoolId: '',
  //     username: '',
  //     school: '',
  //   })
  //   setDepartment({
  //     name: '',
  //     _id: '',
  //     username: '',
  //     schoolId: '',
  //     facultyId: '',
  //     facultyName: '',
  //   })
  //   setEditIndex(null)

  //   if (pastSchools.length === 0) {
  //     getSchoolInfo(`/users/school-app/${user?.userId}`)
  //   }
  // }

  // const clearSchoolInput = () => {
  //   if (schools.length === 0) {
  //     setSchool({
  //       name: schoolText,
  //       username: '',
  //       section: '',
  //       subsection: '',
  //       logo: '',
  //       _id: '',
  //     })
  //     formHistory.schoolName = schoolText
  //     formHistory.isNew = true
  //     setSchoolText('')
  //   }
  // }

  // const clearFacultyInput = () => {
  //   if (faculties.length === 0) {
  //     setFaculty({
  //       name: facultyText,
  //       school: school.name,
  //       schoolId: school._id,
  //       username: '',
  //       _id: '',
  //     })
  //     formHistory.faculty = facultyText
  //     setFacultyText('')
  //   }
  // }

  // const clearDepartmentInput = () => {
  //   if (departments.length === 0) {
  //     setDepartment({
  //       name: departmentText,
  //       facultyId: faculty._id,
  //       schoolId: school._id,
  //       facultyName: faculty.name,
  //       username: '',
  //       _id: '',
  //     })
  //     formHistory.department = departmentText
  //     setDepartmentText('')
  //   }
  // }

  // const selectLevel = (
  //   index: number,
  //   item: Academic,
  //   clicked: boolean = false
  // ) => {
  //   const maxLevels: MaxLevels[] = []
  //   for (let i = 0; i < item.maxLevel; i++) {
  //     const maxLevel = {
  //       level: i,
  //       isActive: false,
  //     }
  //     maxLevels.push(maxLevel)
  //   }
  //   if (
  //     !item.levelName.includes('Primary') &&
  //     !item.levelName.includes('Secondary')
  //   ) {
  //     setIsAdvanced(true)
  //   } else {
  //     setIsAdvanced(false)
  //   }
  //   formHistory.academicLevelName = item.levelName
  //   formHistory.academicLevel = item.level
  //   formHistory.degree = item.degree
  //   formHistory.subsectionDegree = item.subsectionDegree
  //   toggleActive(index)
  //   if (clicked) {
  //     setSchool({
  //       section: '',
  //       username: '',
  //       subsection: '',
  //       name: '',
  //       logo: '',
  //       _id: '',
  //     })
  //   }
  // }

  // const selectSchool = async (school: ISchool) => {
  //   setSchool(school)
  //   setSchoolList(false)
  //   setSchoolText('')
  //   formHistory.schoolName = school.name
  //   formHistory.schoolUsername = school.username
  //   formHistory.schoolLogo = school.logo
  //   formHistory.schoolId = school._id
  // }

  // const onChangeEntry = (event: any, date?: Date) => {
  //   if (Platform.OS === 'android') setShowPickerEntry(false)

  //   if (date) {
  //     if (
  //       formHistory.exitYear &&
  //       new Date(date).getTime() >= new Date(formHistory.exitYear).getTime()
  //     ) {
  //       setMessage('Invalid Date. Entry year must be before exit year.', false)
  //       return
  //     }

  //     setSelectedDateEntry(date)
  //     formHistory.entryYear = new Date(date)
  //   }
  // }

  // const onChangeExit = (event: any, date?: Date) => {
  //   if (Platform.OS === 'android') setShowPickerExit(false)

  //   if (date) {
  //     if (
  //       formHistory.entryYear &&
  //       new Date(date).getTime() <= new Date(formHistory.entryYear).getTime()
  //     ) {
  //       setMessage('Invalid Date. Exit year must be after entry year.', false)
  //       return
  //     }

  //     setSelectedDateExit(date)
  //     formHistory.exitYear = new Date(date)
  //   }
  // }

  const handleSubmit = async () => {
    // const inputsToValidate = [
    //   {
    //     name: 'pastSchools',
    //     value: JSON.stringify(pastSchools),
    //     rules: { blank: true, minLength: 2 },
    //     field: 'Past schools',
    //   },
    //   {
    //     name: 'action',
    //     value: 'EducationHistory',
    //     rules: { blank: true },
    //     field: 'History',
    //   },
    //   {
    //     name: 'isEducationHistory',
    //     value: true,
    //     rules: { blank: true },
    //     field: 'History',
    //   },
    //   {
    //     name: 'inSchool',
    //     value: schoolForm.inSchool,
    //     rules: { blank: true },
    //     field: 'In School',
    //   },
    //   {
    //     name: 'ID',
    //     value: String(user?._id),
    //     rules: { blank: true },
    //     field: 'ID ',
    //   },
    // ]
    // const { messages, valid } = validateInputs(inputsToValidate)
    // if (!valid) {
    //   const getFirstNonEmptyMessage = (
    //     messages: Record<string, string>
    //   ): string | null => {
    //     for (const key in messages) {
    //       if (messages[key].trim() !== '') {
    //         return messages[key]
    //       }
    //     }
    //     return null
    //   }
    //   const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    //   if (firstNonEmptyMessage) {
    //     setMessage(firstNonEmptyMessage, false)
    //     return
    //   }
    // }
    // const data = appendForm(inputsToValidate)
    // setAlert(
    //   'Warning',
    //   'You will need to contact support to edit some of these information after verification!',
    //   true,
    //   () => submitData(data)
    // )
  }

  const submitData = async (data: FormData) => {
    // updateUserInfo(`${url}${user?.userId}`, data)
    // setAdded(false)
  }

  return (
    <>
      {pastSchools.length > 0 && (
        <>
          {pastSchools.map((item, index) => (
            <View key={index} className="px-3 flex-1 mb-5">
              <View className="px-3 z-30 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]">
                <View className="py-2 border-b border-b-border dark:border-b-dark-border mb-5">
                  <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                    Place of Education
                  </Text>
                  <View className="flex-row">
                    <Text className="text-xl text-secondary dark:text-dark-secondary">
                      {item.schoolArea} {item.schoolState} State,
                      {item.schoolCountry}
                    </Text>
                  </View>
                </View>
                <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
                  <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                    Education Level
                  </Text>
                  <View className="flex-row">
                    <Text className="text-xl text-secondary dark:text-dark-secondary">
                      {item.schoolAcademicLevel.levelName}
                    </Text>
                  </View>
                </View>
                <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
                  <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                    Institution
                  </Text>
                  <View className="flex-row">
                    <Text className="text-xl text-secondary dark:text-dark-secondary">
                      {item.schoolName}
                    </Text>
                  </View>
                </View>

                {item.schoolDepartment && (
                  <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
                    <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                      Department
                    </Text>
                    <View className="flex-row">
                      <Text className="text-xl text-secondary dark:text-dark-secondary">
                        {item.schoolDepartment}
                      </Text>
                    </View>
                  </View>
                )}

                <View
                  className={`${
                    isHistoryEdit
                      ? 'mb-4 border-b border-b-border dark:border-b-dark-border'
                      : ''
                  } flex-row flex-wrap justify-start py-2`}
                >
                  <View className="mb-4 mr-[40px]">
                    <Text className="text-lg text-primaryLight dark:text-dark-primaryLight mb-2">
                      Admitted On
                    </Text>
                    <Text className="text-xl text-secondary dark:text-dark-secondary">
                      {formatDate(String(item.admittedAt))}
                    </Text>
                  </View>
                  <View className="mb-4 mx-2">
                    <Text className="text-lg text-primaryLight dark:text-dark-primaryLight mb-2">
                      Graduated On
                    </Text>
                    <Text className="text-xl bg-cus text-secondary dark:text-dark-secondary">
                      {formatDate(String(item.graduatedAt))}
                    </Text>
                  </View>
                </View>

                {isHistoryEdit && (
                  <View className="w-full flex-row justify-end mb-4">
                    <TouchableOpacity
                      onPress={() => tempEdit(index, item)}
                      className="flex mr-7"
                    >
                      <Feather
                        name="edit-3"
                        size={width * 0.08}
                        color={isDark ? '#EFEFEF' : '#3A3A3A'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => tempDelete(index)}
                      className="flex"
                    >
                      <Feather
                        name="trash-2"
                        size={width * 0.08}
                        color="#DA3986"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}

          {!isHistoryEdit && (
            <View className="px-3">
              <CustomBtn
                label="Edit this Information"
                loading={false}
                handleSubmit={() => setHistoryEdit(true)}
              />
            </View>
          )}
        </>
      )}

      {isHistoryEdit && (
        <View className={`flex px-3`}>
          <View className="mb-6">
            <Text className="uppercase text-center mb-5 text-secondary dark:text-dark-secondary">
              set current Place of study
            </Text>
            <CustomDropdown
              data={countries}
              label="Select Country"
              placeholder={
                bioUserPastSchoolForm.schoolCountry
                  ? bioUserPastSchoolForm.schoolCountry
                  : 'Select Country'
              }
              onSelect={selectCountry}
            />
            <CustomDropdown
              data={states}
              type="state"
              label="Select State"
              placeholder={
                bioUserPastSchoolForm.schoolState
                  ? bioUserPastSchoolForm.schoolState
                  : 'Select State'
              }
              onSelect={selectState}
              disabled={!bioUserPastSchoolForm.schoolCountry}
              errorMessage={
                !bioUserPastSchoolForm.schoolCountry
                  ? 'Please select country first to continue.'
                  : undefined
              }
            />
            <CustomDropdown
              data={area}
              label="Select Area"
              type="area"
              placeholder={
                bioUserPastSchoolForm.schoolArea
                  ? bioUserPastSchoolForm.schoolArea
                  : 'Select Area'
              }
              onSelect={selectArea}
              disabled={!bioUserPastSchoolForm.schoolState}
              errorMessage={
                !bioUserPastSchoolForm.schoolState
                  ? 'Please select school state first to continue.'
                  : undefined
              }
            />
          </View>

          {academicResults.length > 0 &&
            bioUserPastSchoolForm.schoolCountry && (
              <View className="flex-row w-full flex-wrap mb-8">
                <Text className="text-center w-full uppercase text-secondary dark:text-dark-secondary mb-2">
                  Select current academic program
                </Text>
                {academicResults.map((item, index) => (
                  <View className="mr-4" key={index}>
                    <RadioButton
                      label={item.levelName}
                      selected={item.isActive}
                      onPress={() => selectLevel(index, item, true)}
                    />
                  </View>
                ))}
              </View>
            )}

          {bioUserPastSchoolForm.schoolAcademicLevel &&
            bioUserPastSchoolForm.schoolAcademicLevel.levelName !== '' &&
            bioUserPastSchoolForm.schoolState && (
              <View className="relative mb-8">
                <Text className="uppercase text-center mb-3 text-secondary dark:text-dark-secondary">
                  search current school of study
                </Text>
                <View className="relative -mb-4">
                  <InputField
                    label="School Name"
                    value={schoolName}
                    placeholder="Search school"
                    autoCapitalize="words"
                    onChangeText={(e) => {
                      handleSearchSchool(e)
                    }}
                  />
                  {loadingSchool && (
                    <ActivityIndicator
                      className="absolute right-[10px] bottom-[30px]"
                      size="large"
                      color="#DA39A6"
                    />
                  )}
                </View>
                <TouchableOpacity onPress={setSchool} className="flex-1">
                  <Text className="w-full text-primaryLight text-sm dark:text-dark-primaryLight mb-2">
                    {`If you didn't see your school, write the name and`}{' '}
                    <Text className="text-custom">click here</Text>
                  </Text>
                </TouchableOpacity>
                {searchedSchoolResult.length > 0 && (
                  <ScrollView
                    className="max-h-[200px] border border-border rounded-xl dark:border-dark-border"
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={false}
                  >
                    {searchedSchoolResult.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        className="border-b border-border dark:border-dark-border p-4 flex-row"
                        onPress={() => selectSchool(item)}
                      >
                        {item.logo && (
                          <Image
                            source={{ uri: String(item.logo) }}
                            style={{ width: 30, height: 20, marginRight: 5 }}
                          />
                        )}
                        <Text className="text-primary dark:text-dark-primary">
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}

                {bioUserPastSchoolForm.schoolName && (
                  <View className="flex-row w-full items-center py-3 px-2 border-b border-b-border dark:border-b-dark-border">
                    {bioUserPastSchoolForm.schoolLogo && (
                      <Image
                        source={{
                          uri: String(bioUserPastSchoolForm.schoolLogo),
                        }}
                        style={{ width: 30, height: 20, marginRight: 10 }}
                      />
                    )}
                    <Text className="text-xl flex-1 text-primary dark:text-dark-primary">
                      {bioUserPastSchoolForm.schoolName}
                    </Text>
                  </View>
                )}
              </View>
            )}

          {bioUserPastSchoolForm.schoolName && isAdvanced && (
            <View className="relative mb-8">
              <Text className="uppercase text-center mb-3 text-secondary dark:text-dark-secondary">
                search current department of study
              </Text>

              <View className="relative -mb-4">
                <InputField
                  label="Department Name"
                  value={schoolDepartment}
                  placeholder="Search department"
                  autoCapitalize="words"
                  onChangeText={(e) => {
                    handleSearchDepartment(e)
                  }}
                />
                {loadingSchool && (
                  <ActivityIndicator
                    className="absolute right-[10px] bottom-[30px]"
                    size="large"
                    color="#DA39A6"
                  />
                )}
              </View>
              <TouchableOpacity onPress={setDepartment} className="flex-1">
                <Text className="w-full text-primaryLight text-sm dark:text-dark-primaryLight">
                  {`If you didn't see department, write the name and`}{' '}
                  <Text className="text-custom">click here</Text>
                </Text>
              </TouchableOpacity>
              {searchedDepartments.length > 0 && (
                <ScrollView
                  className="max-h-[200px] border border-border rounded-xl dark:border-dark-border"
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                >
                  {searchedDepartments.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      className="border-b border-border dark:border-dark-border p-4 flex-row"
                      onPress={() => selectDepartment(item)}
                    >
                      <Text className="text-primary dark:text-dark-primary">
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {bioUserPastSchoolForm.schoolDepartment && (
                <View className="flex-row w-full items-center py-3 px-2 border-b border-b-border dark:border-b-dark-border">
                  <Text className="text-xl flex-1 text-primary dark:text-dark-primary">
                    {bioUserPastSchoolForm.schoolDepartment}
                  </Text>
                </View>
              )}
            </View>
          )}

          {bioUserPastSchoolForm.schoolArea && (
            <>
              <View className="mb-6 mt-2">
                <Text className="uppercase text-center mb-3 text-secondary dark:text-dark-secondary">
                  set program duration
                </Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => setCalendarVisible(true)}
                >
                  <Calendar size={20} color={isDark ? '#6E6E6E' : '#BABABA'} />
                  <Text className="text-primary dark:text-dark-primary mx-3">
                    Year of Admission:
                  </Text>
                  <Text className="text-custom">
                    {bioUserPastSchoolForm.admittedAt
                      ? dayjs(bioUserPastSchoolForm.admittedAt).format(
                          'DD MMM YYYY'
                        )
                      : 'Select Date'}
                  </Text>
                </TouchableOpacity>

                <PopupCalendar
                  visible={calendarVisible}
                  onClose={() => setCalendarVisible(false)}
                  onSelectDate={(date) =>
                    setBioUserPastSchoolForm('admittedAt', date)
                  }
                />
              </View>

              <View className="mb-8">
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => setCalendarVisible1(true)}
                >
                  <Calendar size={20} color={isDark ? '#6E6E6E' : '#BABABA'} />
                  <Text className="text-primary dark:text-dark-primary mx-3">
                    Year of Graduation:
                  </Text>
                  <Text className="text-custom">
                    {bioUserPastSchoolForm.graduatedAt
                      ? dayjs(bioUserPastSchoolForm.graduatedAt).format(
                          'DD MMM YYYY'
                        )
                      : 'Select Date'}
                  </Text>
                </TouchableOpacity>

                <PopupCalendar
                  visible={calendarVisible1}
                  onClose={() => setCalendarVisible1(false)}
                  onSelectDate={(date) =>
                    setBioUserPastSchoolForm('graduatedAt', date)
                  }
                />
              </View>
            </>
          )}

          {bioUserPastSchoolForm.graduatedAt && (
            <CustomBtn
              label="Add Institution"
              loading={loading}
              handleSubmit={addSchool}
            />
          )}

          {/*
          {loading ? (
            <View className="relative w-full">
              <CustomButton
                containerStyles="w-full mt-1"
                textStyles="text-white text-xl"
                handlePress={() => {}}
                title="Processing..."
              />
              <ActivityIndicator
                className="absolute left-[10px] top-[50%] translate-y-[-50%]"
                size="large"
                color="#fff"
              />
            </View>
          ) : (
            <>
              {pastSchools.length > 0 && (
                <CustomButton
                  containerStyles="w-full mt-1 mb-5"
                  textStyles="text-white text-xl"
                  handlePress={handleSubmit}
                  title="Submit Form"
                />
              )}

              {user?.isEducationHistory && (
                <CustomButton
                  containerStyles="w-full mt-1 mb-5"
                  textStyles="text-white text-xl"
                  handlePress={() => {
                    reinitializeForm()
                  }}
                  title="Cancel Edit"
                />
              )}
            </>
          )} */}
        </View>
      )}
    </>
  )
}
