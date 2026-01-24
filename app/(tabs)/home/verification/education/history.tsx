import {
  View,
  Text,
  useColorScheme,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { Feather } from '@expo/vector-icons'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm, formatDate, getDeviceWidth } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import AcademicStore, { AcademicLevel } from '@/store/school/Academic'
import DepartmentStore, { Department } from '@/store/school/Department'
import {
  BioUserSchoolInfoStore,
  PastSchool,
  PastSchoolEmpty,
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
import { router } from 'expo-router'

interface MaxLevels {
  level: number
  isActive: boolean
}

export default function VerificationEducationHistorySettings() {
  const { bioUserState, bioUser, bioUserSchoolInfo } = AuthStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const width = getDeviceWidth()
  const { toggleActive, getAcademics, academicResults } = AcademicStore()
  const {
    setBioUserPastSchoolForm,
    updateBioUserSchoolInfo,
    setBioUserSchoolInfoForm,
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
  const [isHistoryEdit, setHistoryEdit] = useState(false)
  const { countries, getCountries } = CountryStore()
  const url = '/biousers-school/schools/'
  const [isEditingSchool, setIsEditingSchool] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [schoolName, setSchoolName] = useState('')
  const [schoolDepartment, setSchoolDepartment] = useState('')
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [calendarVisible1, setCalendarVisible1] = useState(false)

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

      if (bioUserState?.isEducationHistory) {
        setHistoryEdit(false)
      } else {
        setHistoryEdit(true)
      }
    }
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
    setBioUserPastSchoolForm('schoolName', item.name)
    setBioUserPastSchoolForm('isNew', false)
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

  const cancelEdit = () => {
    setHistoryEdit(false)
    BioUserSchoolInfoStore.setState({ bioUserPastSchoolForm: PastSchoolEmpty })
  }

  const setSchool = () => {
    if (schoolName.trim().length === 0) return
    setBioUserPastSchoolForm('schoolName', schoolName.trim())
    setBioUserPastSchoolForm('isNew', true)
    setSchoolName('')
    SchoolStore.setState({ searchedSchoolResult: [] })
  }

  const setDepartment = () => {
    if (schoolDepartment.trim().length === 0) return
    setSchoolDepartment('')
    setBioUserPastSchoolForm('schoolDepartment', schoolDepartment.trim())
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
    setBioUserPastSchoolForm('schoolLevelName', item.levelName)
    setBioUserPastSchoolForm('schoolLevel', item.level)
    if (
      !item.levelName.includes('Nursery') &&
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
    getAcademics(`/academic-levels/?inSchool=${false}&country=${country}`)
  }

  const addSchool = () => {
    if (isEditingSchool) {
      BioUserSchoolInfoStore.setState((prev) => {
        const newItems = prev.pastSchools.map((item, index) =>
          index === editIndex
            ? {
                ...bioUserPastSchoolForm,
                bioUserUsername: String(bioUser?.bioUserUsername),
                bioUserId: String(bioUser?._id),
                bioUserPicture: String(bioUser?.bioUserPicture),
                bioUserDisplayName: String(bioUser?.bioUserDisplayName),
              }
            : item
        )
        return {
          pastSchools: newItems,
        }
      })
      BioUserSchoolInfoStore.setState({
        bioUserPastSchoolForm: PastSchoolEmpty,
      })
    } else {
      const inputsToValidate = [
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
          name: 'schoolDepartment',
          value: bioUserPastSchoolForm.schoolDepartment.trim(),
          rules: { blank: isAdvanced ? false : true },
          field: 'Department Name',
        },
        {
          name: 'schoolDepartmentUsername',
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
          pastSchools: [
            ...prev.pastSchools,
            {
              ...bioUserPastSchoolForm,
              bioUserId: String(bioUser?._id),
              bioUserUsername: String(bioUser?.bioUserUsername),
              bioUserPicture: String(bioUser?.bioUserPicture),
              bioUserDisplayName: String(bioUser?.bioUserDisplayName),
            },
          ],
        }
      })
    }

    AcademicStore.getState().resetForm()
    resetSchool()
    setIsAdvanced(false)
    setEditIndex(null)
  }

  const resetSchool = () => {
    BioUserSchoolInfoStore.setState({
      bioUserPastSchoolForm: PastSchoolEmpty,
    })
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
  }

  const tempEdit = (index: number, item: PastSchool) => {
    if (
      item.schoolLevel &&
      !item.schoolLevelName.includes(`Nursery`) &&
      !item.schoolLevelName.includes(`Primary`) &&
      !item.schoolLevelName.includes(`Secondary`)
    ) {
      setIsAdvanced(true)
    }

    getAcademics(
      `/academic-levels/?country=${item.schoolCountry}&inSchool=true`
    )

    getStates(
      `/places/state/?country=${item.schoolCountry}&page_size=350&field=state&sort=state`,
      setMessage
    )
    getArea(
      `/places/area/?state=${item.schoolState}&page_size=350&field=area&sort=area`
    )
    setEditIndex(index)
    setIsEditingSchool(true)
    BioUserSchoolInfoStore.setState({ bioUserPastSchoolForm: item })
  }

  const handleSubmit = async () => {
    if (bioUserState?.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'pastSchools',
        value: JSON.stringify(pastSchools),
        rules: { blank: true, minLength: 2 },
        field: 'Past schools',
      },
      {
        name: 'hasPastSchool',
        value: bioUserSchoolForm.hasPastSchool,
        rules: { blank: true },
        field: 'History',
      },
      {
        name: 'action',
        value: 'EducationHistory',
        rules: { blank: true },
        field: 'History',
      },
      {
        name: 'isEducationHistory',
        value: true,
        rules: { blank: true },
        field: 'History',
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
    const data = appendForm(inputsToValidate)
    setAlert(
      'Warning',
      'You will need to contact support to edit this information after verification is approved!',
      true,
      () => submitData(data)
    )
  }

  const submitData = async (data: FormData) => {
    updateBioUserSchoolInfo(`${url}${bioUser?._id}`, data, () =>
      router.replace(`/home/verification/education/document`)
    )
  }

  return (
    <>
      {pastSchools.length === 0 && (
        <View className="w-full">
          <Text className="text-center uppercase text-secondary dark:text-dark-secondary mb-5">
            Any previous school attended?
          </Text>

          <View className="mb-6">
            <View className="flex-row mb-5">
              <View className="w-1/2 px-2">
                <CustomBtn
                  label="Yes"
                  loading={false}
                  handleSubmit={() =>
                    setBioUserSchoolInfoForm('hasPastSchool', true)
                  }
                  style={bioUserSchoolForm.hasPastSchool ? '' : 'outline'}
                />
              </View>
              <View className="w-1/2 px-2">
                <CustomBtn
                  label="No"
                  loading={false}
                  handleSubmit={() =>
                    setBioUserSchoolInfoForm('hasPastSchool', false)
                  }
                  style={
                    bioUserSchoolForm.hasPastSchool === false ? '' : 'outline'
                  }
                />
              </View>
            </View>
            {bioUserSchoolForm.hasPastSchool === false && (
              <CustomBtn
                label="Continue"
                loading={false}
                handleSubmit={handleSubmit}
              />
            )}
          </View>
        </View>
      )}
      {pastSchools.length > 0 && (
        <>
          {pastSchools.map((item, index) => (
            <View key={index} className="px-3 flex-1 mb-3">
              <View className="px-3 z-30 mb-3 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]">
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
                      {item.schoolLevelName}
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
                        size={width * 0.05}
                        color={isDark ? '#EFEFEF' : '#3A3A3A'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => tempDelete(index)}
                      className="flex"
                    >
                      <Feather
                        name="trash-2"
                        size={width * 0.05}
                        color="#DA3986"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
          <View className="w-full justify-center flex-row mb-8">
            <View className="w-1/2 items-center px-3">
              <CustomBtn
                label="Submit Profile"
                loading={loading}
                handleSubmit={handleSubmit}
              />
            </View>
            {!isHistoryEdit && bioUserState?.isEducationHistory && (
              <View className="px-3 w-1/2">
                <CustomBtn
                  label="Edit Profile"
                  loading={false}
                  handleSubmit={() => setHistoryEdit(true)}
                  style="outline"
                />
              </View>
            )}
          </View>
        </>
      )}

      {isHistoryEdit && bioUserSchoolForm.hasPastSchool && (
        <View className={`flex px-3 min-h-[60vh]`}>
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
            {bioUserPastSchoolForm.schoolCountry && (
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
            )}
            {bioUserPastSchoolForm.schoolState && (
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
            )}
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
                      selected={
                        item.isActive ||
                        bioUserPastSchoolForm.schoolLevelName === item.levelName
                      }
                      onPress={() => selectLevel(index, item, true)}
                    />
                  </View>
                ))}
              </View>
            )}

          {bioUserPastSchoolForm.schoolState && (
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
              loading={false}
              handleSubmit={addSchool}
            />
          )}

          {bioUserState?.isEducationHistory && (
            <View className="">
              <View className="mb-8" />
              <CustomBtn
                label="Cancel Edit"
                loading={false}
                handleSubmit={cancelEdit}
                style="outline"
              />
            </View>
          )}
        </View>
      )}
    </>
  )
}
