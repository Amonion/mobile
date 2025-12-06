import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm } from '@/lib/helpers'
import debounce from 'lodash/debounce'
import api from '@/lib/api'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import CustomDropdown from '@/components/General/CustomDropdown'
import { BioUserSchoolInfoStore } from '@/store/user/BioUserSchoolInfo'
import AreaStore, { Area } from '@/store/place/Area'
import CountryStore from '@/store/place/CountryOrigin'
import StateStore from '@/store/place/StateOrigin'

interface MaxLevels {
  level: number
  isActive: boolean
}

export default function VerificationEducationSettings() {
  const { bioUserSchoolInfo } = AuthStore()
  const { setMessage } = MessageStore()
  const { bioUserSchoolForm, setBioUserSchoolInfoForm } =
    BioUserSchoolInfoStore()
  const { setAlert } = AlartStore()
  const [inSchool, setInSchool] = useState('')
  const { area, getArea } = AreaStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()
  // const { toggleActive, getAcademics, academicResults, activeLevel } =
  //   AcademicStore()
  // const [showInSchool, setShowInSchool] = useState(false)
  // const [isAdvanced, setIsAdvanced] = useState(false)
  // const [isDepartmentList, setDepartmentList] = useState(false)
  // const [isFacultyList, setFacultyList] = useState(false)
  // const [isNew, setIsNew] = useState(false)
  // const [isCurrentEdit, setCurrentEdit] = useState(false)
  // const [schools, setSchools] = useState<ISchool[]>([])
  // const [departments, setDepartments] = useState<IDepartment[]>([])
  // const [faculties, setFaculties] = useState<IFaculty[]>([])
  // const [countries, setCountries] = useState<Country[]>([])
  // const [isCountryList, setCountryList] = useState(false)
  // const [isSchoolList, setSchoolList] = useState(false)
  // const [loadingPlace, setLoadingPlace] = useState(false)
  // const [loadingSchools, setLoadingSchools] = useState(false)
  // const [loadingFaculties, setLoadingFaculties] = useState(false)
  // const [loadingDepartments, setLoadingDepartments] = useState(false)
  // const [maxLevels, setMaxLevel] = useState<MaxLevels[]>([])
  // const [place, setPlace] = useState('')
  // const [schoolText, setSchoolText] = useState('')
  // const [facultyText, setFacultyText] = useState('')
  // const [departmentText, setDepartmentText] = useState('')
  // const url = '/users/school-app/'

  // const [department, setDepartment] = useState<IDepartment>({
  //   facultyName: '',
  //   facultyId: '',
  //   schoolId: '',
  //   name: '',
  //   username: '',
  //   _id: '',
  // })
  // const [faculty, setFaculty] = useState<IFaculty>({
  //   school: '',
  //   schoolId: '',
  //   name: '',
  //   username: '',
  //   _id: '',
  // })
  // const [school, setSchool] = useState<ISchool>({
  //   section: '',
  //   subsection: '',
  //   username: '',
  //   name: '',
  //   logo: '',
  //   _id: '',
  // })
  // const [country, setCountry] = useState<Country>({
  //   continent: '',
  //   country: '',
  //   countrySymbol: '',
  //   state: '',
  //   area: '',
  //   countryFlag: '',
  //   id: '',
  // })

  // useEffect(() => {
  //   if (!user) return
  //   // if (!schoolForm.currentSchoolArea) {
  //   //   getSchoolInfo(`/users/userinfo/${user.userId}?school=true`)
  //   // }
  //   if (!user.isEducation) {
  //     setCurrentEdit(true)
  //     setShowInSchool(false)
  //   } else {
  //     setCurrentEdit(false)
  //   }
  // }, [user])

  // useEffect(() => {
  //   if (school._id === '') {
  //     setIsNew(false)
  //   } else {
  //     setIsNew(true)
  //   }
  // }, [school])

  // useEffect(() => {
  //   const words = schoolForm.currentSchoolLevel.split(' ')
  //   const level = Number(words[words.length - 1])
  //   if (maxLevels.length > 0) {
  //     for (let i = 0; i < maxLevels.length; i++) {
  //       const el = maxLevels[i]
  //       if (el.level + 1 === level) {
  //         selectMaxLevel(i)
  //       }
  //     }
  //   }
  // }, [maxLevels.length, isCurrentEdit])

  // useEffect(() => {
  //   setCountry({
  //     continent: schoolForm.currentSchoolContinent,
  //     country: schoolForm.currentSchoolCountry,
  //     state: schoolForm.currentSchoolState,
  //     countrySymbol: schoolForm.currentSchoolCountrySymbol,
  //     area: schoolForm.currentSchoolArea,
  //     countryFlag: schoolForm.currentSchoolCountryFlag,
  //     id: schoolForm.currentSchoolId,
  //   })

  //   setInSchool(schoolForm.inSchool ? 'Yes' : 'No')

  //   if (isCurrentEdit && academicResults.length === 0 && country.country) {
  //     getAcademics(
  //       `/places/academic-levels/?inSchool=${schoolForm.inSchool}&country=${country.country}`
  //     )
  //   }
  // }, [isCurrentEdit])

  // useEffect(() => {
  //   if (schoolForm.currentSchoolArea) {
  //     for (let i = 0; i < academicResults.length; i++) {
  //       const el = academicResults[i]
  //       if (el.levelName === schoolForm.currentAcademicLevelName) {
  //         selectLevel(i, el, false)
  //       }
  //     }
  //   }
  //   setSchool({
  //     name: schoolForm.currentSchoolName,
  //     section: '',
  //     subsection: '',
  //     username: schoolForm.currentSchoolUsername,
  //     logo: schoolForm.currentSchoolLogo,
  //     _id: schoolForm.currentSchoolId,
  //   })

  //   if (
  //     !schoolForm.currentAcademicLevelName.includes('Primary') &&
  //     !schoolForm.currentAcademicLevelName.includes('Secondary')
  //   ) {
  //     setFaculty({
  //       school: schoolForm.currentSchoolName,
  //       schoolId: schoolForm.currentSchoolId,
  //       name: schoolForm.currentFaculty,
  //       username: schoolForm.currentFacultyUsername,
  //       _id: schoolForm.currentFacultyId,
  //     })
  //     setDepartment({
  //       facultyName: schoolForm.currentFaculty,
  //       facultyId: schoolForm.currentFacultyId,
  //       schoolId: schoolForm.currentSchoolId,
  //       name: schoolForm.currentDepartment,
  //       username: schoolForm.currentDepartmentUsername,
  //       _id: schoolForm.currentDepartmentId,
  //     })
  //   }
  // }, [isCurrentEdit, inSchool, academicResults.length])

  // const handleSearchPlace = useMemo(
  //   () =>
  //     debounce(async (value: string) => {
  //       if (!value) {
  //         setCountryList(false)
  //         return
  //       }
  //       setCountryList(true)
  //       try {
  //         setLoadingPlace(true)
  //         const response = await api.get(`/places/all/?place=${value}`)
  //         const data = response?.data
  //         if (data) {
  //           setCountries(data.results as Country[])
  //         }
  //       } catch (error) {
  //       } finally {
  //         setLoadingPlace(false)
  //       }
  //     }, 1000),
  //   []
  // )

  // const handleSearchSchool = useMemo(
  //   () =>
  //     debounce(async (value: string, state: string) => {
  //       if (!value) {
  //         setSchoolList(false)
  //         return
  //       }

  //       try {
  //         setLoadingSchools(true)
  //         const response = await api.get(
  //           `/schools/?name=${value}&state=${state}`
  //         )
  //         const data = response?.data
  //         if (data) {
  //           setSchools(data.results as ISchool[])
  //           if (data.results.length > 0) {
  //             setSchoolList(true)
  //           } else {
  //             setSchoolList(false)
  //           }
  //         }
  //       } catch (error) {
  //       } finally {
  //         setLoadingSchools(false)
  //       }
  //     }, 1000),
  //   []
  // )

  // const handleSearchFaculty = useMemo(
  //   () =>
  //     debounce(async (value: string, schoolName: string) => {
  //       if (!value) {
  //         setFacultyList(false)
  //         return
  //       }
  //       try {
  //         setLoadingFaculties(true)
  //         const response = await api.get(
  //           `/schools/faculties/?name=${value}&school=${schoolName}`
  //         )
  //         const data = response?.data
  //         if (data) {
  //           setFaculties(data.results as IFaculty[])
  //           if (data.results.length > 0) {
  //             setFacultyList(true)
  //           } else {
  //             setFacultyList(false)
  //           }
  //         }
  //       } catch (error) {
  //       } finally {
  //         setLoadingFaculties(false)
  //       }
  //     }, 1000),
  //   []
  // )

  // const handleSearchDepartment = useMemo(
  //   () =>
  //     debounce(async (value: string, facultyName: string) => {
  //       if (!value) {
  //         setDepartmentList(false)
  //         return
  //       }
  //       try {
  //         const response = await api.get(
  //           `/schools/departments/?name=${value}&school=${school.name}&faculty=${facultyName}`
  //         )
  //         const data = response?.data
  //         if (data) {
  //           setDepartments(data.results as IDepartment[])
  //           if (data.results.length > 0) {
  //             setDepartmentList(true)
  //           } else {
  //             setDepartmentList(false)
  //           }
  //         }
  //       } catch (error) {
  //       } finally {
  //         setLoadingDepartments(false)
  //       }
  //     }, 1000),
  //   []
  // )

  // const clearSchool = (item?: string) => {
  //   if (item === 'school') {
  //     setFaculty({
  //       school: '',
  //       schoolId: '',
  //       name: '',
  //       username: '',
  //       _id: '',
  //     })
  //     setDepartment({
  //       facultyName: '',
  //       facultyId: '',
  //       schoolId: '',
  //       name: '',
  //       username: '',
  //       _id: '',
  //     })
  //   } else if (item === 'faculty') {
  //     setDepartment({
  //       facultyName: '',
  //       facultyId: '',
  //       schoolId: '',
  //       name: '',
  //       username: '',
  //       _id: '',
  //     })
  //   } else {
  //     setSchool({
  //       section: '',
  //       subsection: '',
  //       username: '',
  //       name: '',
  //       logo: '',
  //       _id: '',
  //     })
  //     setFaculty({
  //       school: '',
  //       schoolId: '',
  //       name: '',
  //       username: '',
  //       _id: '',
  //     })
  //     setDepartment({
  //       facultyName: '',
  //       facultyId: '',
  //       schoolId: '',
  //       name: '',
  //       username: '',
  //       _id: '',
  //     })
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
  //   setMaxLevel(() => [...maxLevels])
  //   if (
  //     !item.levelName.includes('Primary') &&
  //     !item.levelName.includes('Secondary')
  //   ) {
  //     setIsAdvanced(true)
  //   } else {
  //     setIsAdvanced(false)
  //   }
  //   toggleActive(index)
  //   if (clicked) {
  //     clearSchool()
  //   }
  // }

  // const selectSchool = async (school: ISchool) => {
  //   setSchool(school)
  //   setSchoolList(false)
  //   setIsNew(false)
  //   setSchoolText('')
  //   clearSchool('school')
  // }

  // const selectCountry = (country: Country) => {
  //   setCountry(country)
  //   setShowInSchool(true)
  //   setCountryList(false)
  //   setInSchool('')
  //   setPlace('')
  //   clearSchool()
  // }

  // const selectFaculty = async (faculty: IFaculty) => {
  //   setFaculty(faculty)
  //   setFacultyList(false)
  //   setFacultyText('')
  //   clearSchool('faculty')
  // }

  // const selectDepartment = async (department: IDepartment) => {
  //   setDepartment(department)
  //   setDepartmentList(false)
  //   setDepartmentText('')
  // }

  // const selectMaxLevel = (index: number) => {
  //   const updatedResults = maxLevels.map((tertiary, idx) => ({
  //     ...tertiary,
  //     isActive: idx === index ? true : false,
  //   }))
  //   setMaxLevel(updatedResults)
  // }

  // const getLevels = async (text: string) => {
  //   const inSchool = text === 'Yes' ? true : false
  //   setInSchool(text)
  //   getAcademics(
  //     `/places/academic-levels/?inSchool=${inSchool}&country=${country.country}`
  //   )
  // }

  // const handleSubmit = async () => {
  //   const array1 = [
  //     {
  //       name: 'currentSchoolContinent',
  //       value: country.continent,
  //       rules: { blank: false, minLength: 3, maxLength: 100 },
  //       field: 'continent',
  //     },
  //     {
  //       name: 'currentSchoolCountry',
  //       value: country.country,
  //       rules: { blank: false, minLength: 3, maxLength: 100 },
  //       field: 'Country',
  //     },
  //     {
  //       name: 'currentSchoolCountrySymbol',
  //       value: country.countrySymbol,
  //       rules: { blank: true, maxLength: 100 },
  //       field: 'Country',
  //     },
  //     {
  //       name: 'currentSchoolCountryFlag',
  //       value: country.countryFlag,
  //       rules: { blank: false, maxLength: 100 },
  //       field: 'Country Flag',
  //     },
  //     {
  //       name: 'currentSchoolState',
  //       value: country.state,
  //       rules: { blank: false, minLength: 2, maxLength: 100 },
  //       field: 'State',
  //     },
  //     {
  //       name: 'currentSchoolArea',
  //       value: country.area,
  //       rules: { blank: false, minLength: 2, maxLength: 100 },
  //       field: 'Area',
  //     },
  //     {
  //       name: 'currentAcademicLevel',
  //       value: JSON.stringify(activeLevel),
  //       rules: { blank: false, minLength: 2, maxLength: 10000 },
  //       field: 'Current academic level',
  //     },
  //     {
  //       name: 'currentAcademicLevelName',
  //       value: activeLevel.levelName,
  //       rules: { blank: false, minLength: 2, maxLength: 100 },
  //       field: 'Academic level name',
  //     },
  //     {
  //       name: 'action',
  //       value: 'Education',
  //       rules: { blank: true },
  //       field: 'Education',
  //     },
  //     {
  //       name: 'isEducation',
  //       value: true,
  //       rules: { blank: true },
  //       field: 'Education',
  //     },
  //     {
  //       name: 'ID',
  //       value: String(user?._id),
  //       rules: { blank: true },
  //       field: 'ID ',
  //     },
  //     {
  //       name: 'inSchool',
  //       value: inSchool === 'Yes' ? true : false,
  //       rules: { blank: false },
  //       field: 'In School',
  //     },
  //   ]

  //   const array2 = [
  //     {
  //       name: 'currentSchoolName',
  //       value: school.name,
  //       rules: { blank: false, minLength: 2, maxLength: 1000 },
  //       field: 'Current school',
  //     },
  //     {
  //       name: 'currentSchoolLogo',
  //       value: school.logo,
  //       rules: { blank: true, maxLength: 1000 },
  //       field: 'Current school logo',
  //     },
  //     {
  //       name: 'currentSchoolId',
  //       value: school._id,
  //       rules: { blank: true, maxLength: 100 },
  //       field: 'Current school id',
  //     },
  //     {
  //       name: 'isNew',
  //       value: isNew,
  //       rules: { blank: false, maxLength: 100 },
  //       field: 'Is school recorded',
  //     },
  //     {
  //       name: 'currentFaculty',
  //       value: faculty.name,
  //       rules: { blank: isAdvanced ? false : true, maxLength: 100 },
  //       field: 'Current faculty',
  //     },
  //     {
  //       name: 'currentFacultyUsername',
  //       value: faculty.username,
  //       rules: { blank: true, maxLength: 100 },
  //       field: 'Current faculty username',
  //     },
  //     {
  //       name: 'currentDepartment',
  //       value: department.name,
  //       rules: { blank: isAdvanced ? false : true, maxLength: 100 },
  //       field: 'Current department',
  //     },
  //     {
  //       name: 'currentDepartmentUsername',
  //       value: department.username,
  //       rules: { blank: true, maxLength: 100 },
  //       field: 'Current department username',
  //     },
  //     {
  //       name: 'currentSchoolLevel',
  //       value: `${activeLevel.maxLevelName} ${
  //         Number(maxLevels.find((e) => e.isActive)?.level) + 1
  //       }`,
  //       rules: { blank: false, minLength: 2, maxLength: 100 },
  //       field: 'Current school level',
  //     },
  //   ]

  //   const inputsToValidate =
  //     inSchool === 'Yes' ? [...array1, ...array2] : [...array1]
  //   const { messages, valid } = validateInputs(inputsToValidate)

  //   if (!valid) {
  //     const getFirstNonEmptyMessage = (
  //       messages: Record<string, string>
  //     ): string | null => {
  //       for (const key in messages) {
  //         if (messages[key].trim() !== '') {
  //           return messages[key]
  //         }
  //       }
  //       return null
  //     }

  //     const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
  //     if (firstNonEmptyMessage) {
  //       setMessage(firstNonEmptyMessage, false)
  //       return
  //     }
  //   }

  //   const data = appendForm(inputsToValidate)
  //   setAlert(
  //     'Warning',
  //     'You will need to contact support to edit some of these information after verification!',
  //     true,
  //     () => submitData(data)
  //   )
  // }

  // const submitData = async (data: FormData) => {
  //   postSchoolInfo(`${url}${user?.userId}`, data)
  // }

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [])

  useEffect(() => {
    if (!bioUserSchoolInfo) return
    BioUserSchoolInfoStore.setState({ bioUserSchoolForm: bioUserSchoolInfo })
  }, [bioUserSchoolInfo])

  const selectCountry = (country: Area) => {
    setBioUserSchoolInfoForm('schoolContinent', country.continent)
    setBioUserSchoolInfoForm('schoolCountry', country.country)
    setBioUserSchoolInfoForm('schoolCountryFlag', String(country.countryFlag))
    setBioUserSchoolInfoForm('schoolCountrySymbol', country.countrySymbol)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    setBioUserSchoolInfoForm('schoolState', '')
    setBioUserSchoolInfoForm('schoolArea', '')
    StateStore.setState({ states: [] })
    AreaStore.setState({ area: [] })
  }

  const selectState = (state: Area) => {
    setBioUserSchoolInfoForm('schoolState', state.state)
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
    setBioUserSchoolInfoForm('schoolArea', '')
    AreaStore.setState({ area: [] })
  }

  const selectArea = (area: Area) => {
    setBioUserSchoolInfoForm('schoolArea', area.area)
    setBioUserSchoolInfoForm('schoolPlaceId', area.id)
  }
  return (
    <>
      {true ? (
        <View className={`flex px-3`}>
          {/* <Text className="text-lg my-2 text-primaryLight dark:text-dark-primaryLight">
            Area of current education level
          </Text> */}
          <CustomDropdown
            data={countries}
            label="Select Country"
            placeholder={
              bioUserSchoolForm.schoolCountry
                ? bioUserSchoolForm.schoolCountry
                : 'Select Country'
            }
            onSelect={selectCountry}
          />
          <CustomDropdown
            data={states}
            label="Select State"
            placeholder={
              bioUserSchoolForm.schoolState
                ? bioUserSchoolForm.schoolState
                : 'Select State'
            }
            onSelect={selectState}
            disabled={!bioUserSchoolForm.schoolCountry}
            errorMessage={
              !bioUserSchoolForm.schoolCountry
                ? 'Please select country first to continue.'
                : undefined
            }
          />
          <CustomDropdown
            data={area}
            label="Select Area"
            placeholder={
              bioUserSchoolForm.schoolArea
                ? bioUserSchoolForm.schoolArea
                : 'Select Area'
            }
            onSelect={selectArea}
          />

          {/* {(showInSchool || country.area) && (
            <View className="mb-8">
              <Text className="text-center uppercase text-xl text-secondary dark:text-dark-secondary mb-2">
                Are you currently in any academic program?
              </Text>

              <View className="flex-row justify-center">
                <View className="mb-4 ">
                  <View className="flex-row">
                    <CustomButton
                      containerStyles={`${
                        inSchool === 'Yes'
                          ? 'bg-custom'
                          : 'bg-secondary dark:bg-dark-secondary'
                      } min-w-[120px]`}
                      textStyles="text-secondary dark:text-dark-secondary text-xl"
                      handlePress={() => {
                        getLevels('Yes')
                      }}
                      title="Yes, I am"
                    />
                    <View className="mx-2"></View>
                    <CustomButton
                      containerStyles={`${
                        inSchool === 'No'
                          ? 'bg-custom'
                          : 'bg-secondary dark:bg-dark-secondary'
                      } min-w-[120px]`}
                      textStyles="text-secondary dark:text-dark-secondary text-xl"
                      handlePress={() => {
                        getLevels('No')
                      }}
                      title="No, I am not"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {academicResults.length > 0 && (
            <View className="flex-row w-full flex-wrap mb-8">
              <Text className="text-center w-full uppercase text-xl text-secondary dark:text-dark-secondary mb-2">
                Select current academic program
              </Text>
              {academicResults.map((item, index) => (
                <View className="mr-4" key={index}>
                  <CustomRadioButton
                    label={item.levelName}
                    selected={item.isActive}
                    onPress={() => selectLevel(index, item, true)}
                  />
                </View>
              ))}
            </View>
          )}

          {activeLevel.levelName !== '' && inSchool === 'Yes' && (
            <View className="relative mb-8">
              <Text className="w-full text-primaryLight text-sm dark:text-dark-primaryLight mb-2">
                {`If you didn't see your school, write the name and`}{' '}
                <Text className="text-custom">click here</Text>
              </Text>
              <CustomInputSearch
                keyboardType="web-search"
                isFocus={true}
                otherStyles="mb-1"
                placeholder="Search your school by name..."
                value={schoolText}
                handleChangeText={(text) => {
                  setSchoolText(text)
                  handleSearchSchool(text, country.state)
                }}
                onInputBlur={() => {
                  if (schools.length === 0) {
                    setSchool({
                      section: '',
                      subsection: '',
                      username: '',
                      name: schoolText,
                      logo: '',
                      _id: '',
                    })
                    setSchoolList(false)
                  }
                }}
                loading={loadingSchools}
              />

              {school.name && (
                <View className="flex-row w-full items-center mb-3 py-3 px-2 border-b border-b-border dark:border-b-dark-border">
                  {school.logo && (
                    <Image
                      source={{ uri: String(school.logo) }}
                      style={{ width: 70, height: 40 }}
                    />
                  )}
                  <Text className="text-xl flex-1 text-primary dark:text-dark-primary ml-3">
                    {school.name}
                  </Text>
                </View>
              )}

              {isSchoolList && (
                <ScrollView
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  style={{
                    bottom: 60,
                  }}
                  className="max-h-[300px] bg-secondary dark:bg-dark-secondary absolute z-30 left-0 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]"
                >
                  {schools.map((item, index) => (
                    <TouchableOpacity
                      onPress={() => selectSchool(item)}
                      key={index}
                      className="flex-row relative w-full items-center py-3 px-2 border-b border-b-border dark:border-b-dark-border"
                    >
                      {item.logo && (
                        <Image
                          source={{ uri: String(item.logo) }}
                          style={{ width: 70, height: 40 }}
                        />
                      )}
                      <Text className="text-primary flex-1 dark:text-dark-primary text-xl ml-2">
                        {item.name}
                      </Text>
                      <Text className="text-primaryLight absolute right-[2px] text-sm top-0 dark:text-dark-primaryLight">
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {activeLevel.levelName !== '' && school.name !== '' && isAdvanced && (
            <View className="relative mb-8">
              <Text className="w-full text-primaryLight text-sm dark:text-dark-primaryLight mb-2">
                {`If you didn't see your faculty, write the name and`}{' '}
                <Text className="text-custom">click here</Text>
              </Text>
              <CustomInputSearch
                keyboardType="web-search"
                isFocus={true}
                otherStyles="mb-1"
                placeholder="Enter your faculty..."
                value={facultyText}
                handleChangeText={(text) => {
                  setFacultyText(text)
                  handleSearchFaculty(text, school.name)
                }}
                onInputBlur={() => {
                  if (faculties.length === 0) {
                    setFaculty({
                      school: school.name,
                      schoolId: school._id,
                      name: facultyText,
                      username: '',
                      _id: '',
                    })
                    setFacultyList(false)
                  }
                }}
                loading={loadingFaculties}
              />

              {faculty.name && (
                <View className="flex-row w-full items-center mb-3 py-3 px-2 border-b border-b-border dark:border-b-dark-border">
                  <Text className="text-xl text-primary dark:text-dark-primary flex-1">
                    {faculty.name}
                  </Text>
                </View>
              )}

              {isFacultyList && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={{
                    bottom: 60,
                  }}
                  className="max-h-[300px] bg-secondary dark:bg-dark-secondary absolute z-30 left-0 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]"
                >
                  {faculties.map((item, index) => (
                    <TouchableOpacity
                      onPress={() => selectFaculty(item)}
                      key={index}
                      className="flex-row relative w-full items-center py-3 px-2 border-b border-b-border dark:border-b-dark-border"
                    >
                      <Text className="text-primary flex-1 dark:text-dark-primary text-xl">
                        {item.name}
                      </Text>
                      <Text className="text-primaryLight absolute right-[2px] text-sm top-0 dark:text-dark-primaryLight">
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {activeLevel.levelName !== '' &&
            school.name !== '' &&
            isAdvanced &&
            faculty.name !== '' && (
              <View className="relative mb-8">
                <Text className="w-full text-primaryLight text-sm dark:text-dark-primaryLight mb-2">
                  {`If you didn't see your dept., write the name and`}{' '}
                  <Text className="text-custom">click here</Text>
                </Text>
                <CustomInputSearch
                  keyboardType="web-search"
                  isFocus={true}
                  otherStyles="mb-1"
                  placeholder="Enter your department..."
                  value={departmentText}
                  handleChangeText={(text) => {
                    setDepartmentText(text)
                    handleSearchDepartment(text, faculty.name)
                  }}
                  onInputBlur={() => {
                    if (departments.length === 0) {
                      setDepartment({
                        facultyName: faculty.name,
                        facultyId: faculty._id,
                        schoolId: school._id,
                        name: departmentText,
                        username: '',
                        _id: '',
                      })
                      setDepartmentList(false)
                    }
                  }}
                  loading={loadingDepartments}
                />

                {department.name && (
                  <View className="flex-row w-full items-center mb-3 py-3 px-2 border-b border-b-border dark:border-b-dark-border">
                    <Text className="text-xl flex-1 text-primary dark:text-dark-primary">
                      {department.name}
                    </Text>
                  </View>
                )}

                {isDepartmentList && (
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    style={{
                      bottom: 60,
                    }}
                    className="max-h-[300px] bg-secondary dark:bg-dark-secondary absolute z-30 left-0 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]"
                  >
                    {departments.map((item, index) => (
                      <TouchableOpacity
                        onPress={() => selectDepartment(item)}
                        key={index}
                        className="flex-row relative w-full items-center py-3 px-2 border-b border-b-border dark:border-b-dark-border"
                      >
                        <Text className="text-primary dark:text-dark-primary text-xl ml-2">
                          {item.name}
                        </Text>
                        <Text className="text-primaryLight absolute right-[2px] text-sm top-0 dark:text-dark-primaryLight">
                          {index + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

          {((isAdvanced && department.name && school.name !== '') ||
            (!isAdvanced &&
              activeLevel.levelName !== '' &&
              school.name !== '')) && (
            <View className="flex-row w-full flex-wrap mb-8">
              {maxLevels.map((item, index) => (
                <View className="mr-4" key={index}>
                  <CustomRadioButton
                    label={`${activeLevel.maxLevelName} ${item.level + 1}`}
                    selected={item.isActive}
                    onPress={() => selectMaxLevel(index)}
                  />
                </View>
              ))}
            </View>
          )}

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
              <CustomButton
                containerStyles="w-full mt-1 mb-5"
                textStyles="text-white text-xl"
                handlePress={handleSubmit}
                title="Update Current Education"
              />

              {user?.isEducation && (
                <CustomButton
                  containerStyles="w-full mt-1 mb-5"
                  textStyles="text-white text-xl"
                  handlePress={() => {
                    setCurrentEdit(false)
                  }}
                  title="Cancel Edit"
                />
              )}
            </>
          )} */}
        </View>
      ) : (
        <View className="px-3 flex-1 mb-5">
          {/* {schoolForm && (
            <View className="px-3 z-30 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]">
              <View className="py-2 border-b border-b-border dark:border-b-dark-border mb-5">
                <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                  Place of Current Education
                </Text>
                <View className="flex-row">
                  <Text className="text-xl text-secondary dark:text-dark-secondary">
                    {schoolForm.currentSchoolArea}{' '}
                    {schoolForm.currentSchoolState}
                    State, {schoolForm.currentSchoolCountry}
                  </Text>
                </View>
              </View>
              <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
                <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                  Current Education Level
                </Text>
                <View className="flex-row">
                  <Text className="text-xl text-secondary dark:text-dark-secondary">
                    {schoolForm.currentAcademicLevelName}
                  </Text>
                </View>
              </View>

              {schoolForm.inSchool && (
                <>
                  {schoolForm.currentSchoolName && (
                    <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
                      <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                        Current Education Institution
                      </Text>
                      <View className="flex-row">
                        <Text className="text-xl text-secondary dark:text-dark-secondary">
                          {schoolForm.currentSchoolName}
                        </Text>
                      </View>
                    </View>
                  )}

                  {schoolForm.currentFaculty && (
                    <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
                      <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                        Faculty of Study
                      </Text>
                      <View className="flex-row">
                        <Text className="text-xl text-secondary dark:text-dark-secondary">
                          {schoolForm.currentFaculty}
                        </Text>
                      </View>
                    </View>
                  )}

                  {schoolForm.currentDepartment && (
                    <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
                      <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                        Department of Study{' '}
                      </Text>
                      <View className="flex-row">
                        <Text className="text-xl text-secondary dark:text-dark-secondary">
                          {schoolForm.currentDepartment}
                        </Text>
                      </View>
                    </View>
                  )}

                  {schoolForm.currentSchoolName && (
                    <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
                      <Text className="text-lg text-primary dark:text-dark-primaryLight mb-1">
                        Level of Study in {schoolForm.currentSchoolName}
                      </Text>
                      <View className="flex-row">
                        <Text className="text-xl text-secondary dark:text-dark-secondary">
                          {schoolForm.currentSchoolLevel}
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )}
              <CustomButton
                containerStyles="w-full mt-1 mb-5"
                textStyles="text-white text-xl"
                handlePress={() => {
                  setCurrentEdit(true)
                }}
                title="Edit Education"
              />
            </View>
          )} */}
        </View>
      )}
    </>
  )
}
