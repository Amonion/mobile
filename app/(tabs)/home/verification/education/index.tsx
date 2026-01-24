import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import CustomDropdown from '@/components/General/CustomDropdown'
import { BioUserSchoolInfoStore } from '@/store/user/BioUserSchoolInfo'
import AreaStore, { Area } from '@/store/place/Area'
import CountryStore from '@/store/place/CountryOrigin'
import StateStore from '@/store/place/StateOrigin'
import CustomBtn from '@/components/General/CustomBtn'
import AcademicStore, { AcademicLevel } from '@/store/school/Academic'
import { RadioButton } from '@/components/General/RadioButton'
import SchoolStore, { School } from '@/store/school/School'
import InputField from '@/components/General/InputField'
import DepartmentStore, { Department } from '@/store/school/Department'
import { router, usePathname } from 'expo-router'
import { Calendar } from 'lucide-react-native'
import PopupCalendar from '@/components/General/PopupCalendar'
import dayjs from 'dayjs'

interface MaxLevels {
  level: number
  isActive: boolean
}

export default function VerificationEducationSettings() {
  const { bioUserSchoolInfo, bioUser, user } = AuthStore()
  const { setMessage } = MessageStore()
  const { searchedSchoolResult, loadingSchool, searchSchool } = SchoolStore()
  const { searchedDepartments, searchDepartment } = DepartmentStore()
  const {
    bioUserSchoolForm,
    loading,
    setBioUserSchoolInfoForm,
    updateBioUserSchoolInfo,
  } = BioUserSchoolInfoStore()
  const { setAlert } = AlartStore()
  const [schoolName, setSchoolName] = useState('')
  const [schoolDepartment, setSchoolDepartment] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [calendarVisible, setCalendarVisible] = useState(false)
  const { area, getArea } = AreaStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [maxLevels, setMaxLevel] = useState<MaxLevels[]>([])
  const url = '/biousers-school/'
  const pathname = usePathname()
  const { toggleActive, getAcademics, academicResults, activeLevel } =
    AcademicStore()

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`
      )
    }
  }, [])

  useEffect(() => {
    if (bioUserSchoolForm.schoolCountry) {
      getLevels(bioUserSchoolForm.schoolCountry)
    }
  }, [bioUserSchoolForm.inSchool])

  useEffect(() => {
    if (academicResults.length > 0 && bioUserSchoolInfo) {
      const index = academicResults.findIndex(
        (item) =>
          item.levelName === bioUserSchoolInfo?.schoolAcademicLevel.levelName
      )
      if (index && index + 1 > 0) {
        selectLevel(index, academicResults[index])
      }
    }
  }, [academicResults.length, bioUserSchoolInfo, pathname])

  useEffect(() => {
    const arr = bioUserSchoolInfo?.schoolYear.split(' ')
    if (maxLevels.length > 0 && arr) {
      const index = maxLevels.findIndex(
        (item) => item.level + 1 === Number(arr[arr.length - 1])
      )
      if (index && index + 1 > 0) {
        selectMaxLevel(index)
      }
    }
  }, [maxLevels.length, bioUserSchoolInfo])

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
    setBioUserSchoolInfoForm('schoolContinent', country.continent)
    setBioUserSchoolInfoForm('schoolCountry', country.country)
    setBioUserSchoolInfoForm('schoolCountryFlag', String(country.countryFlag))
    setBioUserSchoolInfoForm('schoolCountrySymbol', country.countrySymbol)
    setBioUserSchoolInfoForm('schoolState', '')
    setBioUserSchoolInfoForm('schoolArea', '')
    getLevels(country.country)
    AcademicStore.setState({ academicResults: [] })
    StateStore.setState({ states: [] })
    AreaStore.setState({ area: [] })
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
  }

  const selectState = (state: Area) => {
    setBioUserSchoolInfoForm('schoolState', state.state)
    setBioUserSchoolInfoForm('schoolArea', '')
    AreaStore.setState({ area: [] })
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
  }

  const selectArea = (area: Area) => {
    setBioUserSchoolInfoForm('schoolArea', area.area)
    setBioUserSchoolInfoForm('schoolPlaceId', area.id)
  }

  const selectSchool = (item: School) => {
    setIsNew(false)
    setBioUserSchoolInfoForm('schoolName', item.name)
    setBioUserSchoolInfoForm('schoolId', item._id)
    setBioUserSchoolInfoForm('schoolPicture', String(item.media))
    setBioUserSchoolInfoForm('schoolLogo', String(item.logo))
    setSchoolName('')
    SchoolStore.setState({ searchedSchoolResult: [] })
  }

  const selectDepartment = (item: Department) => {
    setBioUserSchoolInfoForm('schoolDepartment', item.name)
    setBioUserSchoolInfoForm('schoolDepartmentUsername', item.username)
    setBioUserSchoolInfoForm('schoolDepartmentId', item._id)
    setSchoolDepartment('')
    DepartmentStore.setState({ searchedDepartments: [] })
  }

  const selectMaxLevel = (index: number) => {
    const updatedResults = maxLevels.map((tertiary, idx) => ({
      ...tertiary,
      isActive: idx === index ? true : false,
    }))
    setMaxLevel(updatedResults)
    setBioUserSchoolInfoForm(
      'schoolYear',
      `${activeLevel.maxLevelName} ${index + 1}`
    )
  }

  const setSchool = () => {
    if (schoolName.trim().length === 0) return
    setIsNew(true)
    setBioUserSchoolInfoForm('schoolName', schoolName)
    setSchoolName('')
    SchoolStore.setState({ searchedSchoolResult: [] })
  }

  const setDepartment = () => {
    if (schoolDepartment.trim().length === 0) return
    setSchoolDepartment('')
    setBioUserSchoolInfoForm('schoolDepartment', schoolDepartment)
    DepartmentStore.setState({ searchedDepartments: [] })
  }

  const getLevels = async (country: string) => {
    getAcademics(
      `/academic-levels/?inSchool=${bioUserSchoolForm.inSchool}&country=${country}`
    )
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
    setBioUserSchoolInfoForm('schoolAcademicLevel', item)
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

  const handleSubmit = async () => {
    const array0 = [
      {
        name: 'inSchool',
        value: bioUserSchoolForm.inSchool,
        rules: { blank: true, maxLength: 100 },
        field: 'In school',
      },
      {
        name: 'isEducation',
        value: true,
        rules: { blank: true, maxLength: 100 },
        field: 'In school',
      },
    ]
    const array1 = [
      {
        name: 'schoolContinent',
        value: bioUserSchoolForm.schoolContinent,
        rules: { blank: false, minLength: 3, maxLength: 100 },
        field: 'Continent',
      },
      {
        name: 'schoolYear',
        value: bioUserSchoolForm.schoolYear,
        rules: {
          blank: bioUserSchoolForm.inSchool ? false : true,
          minLength: 2,
          maxLength: 1000,
        },
        field: 'School Year',
      },
      {
        name: 'schoolCountry',
        value: bioUserSchoolForm.schoolCountry,
        rules: { blank: false, minLength: 3, maxLength: 100 },
        field: 'Country',
      },
      {
        name: 'schoolCountrySymbol',
        value: bioUserSchoolForm.schoolCountrySymbol,
        rules: { blank: true, maxLength: 100 },
        field: 'Country Symbol',
      },
      {
        name: 'schoolCountryFlag',
        value: bioUserSchoolForm.schoolCountryFlag,
        rules: { blank: false, maxLength: 100 },
        field: 'Country Flag',
      },
      {
        name: 'schoolState',
        value: bioUserSchoolForm.schoolState,
        rules: { blank: false, minLength: 2, maxLength: 100 },
        field: 'State',
      },
      {
        name: 'schoolArea',
        value: bioUserSchoolForm.schoolArea,
        rules: { blank: false, minLength: 2, maxLength: 100 },
        field: 'Area',
      },
      {
        name: 'schoolName',
        value: bioUserSchoolForm.schoolName,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'School name',
      },
      {
        name: 'schoolPicture',
        value: bioUserSchoolForm.schoolPicture,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'School picture',
      },
      {
        name: 'schoolLogo',
        value: bioUserSchoolForm.schoolLogo,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'School logo',
      },
      {
        name: 'schoolId',
        value: bioUserSchoolForm.schoolId,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'School id',
      },
      {
        name: 'schoolDepartment',
        value: bioUserSchoolForm.schoolDepartment,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'School department',
      },
      {
        name: 'schoolDepartmentUsername',
        value: bioUserSchoolForm.schoolDepartmentUsername,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'School department username',
      },
      {
        name: 'schoolDepartmentId',
        value: bioUserSchoolForm.schoolDepartmentId,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'School department id',
      },
      {
        name: 'admittedAt',
        value: bioUserSchoolForm.admittedAt,
        rules: { blank: false, minLength: 2, maxLength: 1000 },
        field: 'Entry Date',
      },
      {
        name: 'schoolAcademicLevel',
        value: JSON.stringify(bioUserSchoolForm.schoolAcademicLevel),
        rules: { blank: false, minLength: 2, maxLength: 10000 },
        field: 'School academic level',
      },
      {
        name: 'action',
        value: 'Education',
        rules: { blank: true },
        field: 'Education',
      },
      {
        name: 'isEducation',
        value: true,
        rules: { blank: true },
        field: 'Education',
      },
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true },
        field: 'ID ',
      },
      {
        name: 'bioUSerId',
        value: String(bioUser?._id),
        rules: { blank: true, maxLength: 100 },
        field: 'continent',
      },
      {
        name: 'inSchool',
        value: bioUserSchoolForm.inSchool,
        rules: { blank: false },
        field: 'In School',
      },
      {
        name: 'isNew',
        value: isNew,
        rules: { blank: false, maxLength: 100 },
        field: 'Is school recorded',
      },
    ]

    const inputsToValidate = bioUserSchoolForm.inSchool ? array1 : array0
    const { messages, valid } = validateInputs(inputsToValidate)
    if (!valid) {
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
    }

    const data = appendForm(inputsToValidate)
    setAlert(
      'Warning',
      'You will need to contact support to edit some of these information after verification!',
      true,
      () => submitData(data)
    )
  }

  const submitData = async (data: FormData) => {
    updateBioUserSchoolInfo(`${url}${bioUser?._id}`, data, () =>
      router.replace(`/home/verification/education/history`)
    )
  }
  return (
    <>
      {true ? (
        <View className={`flex px-3 min-h-[60vh]`}>
          <Text className="text-center uppercase text-secondary dark:text-dark-secondary mb-5">
            Are you currently in any academic program?
          </Text>

          <View className="mb-6">
            <View className="flex-row mb-5">
              <View className="w-1/2 px-2">
                <CustomBtn
                  label="Yes"
                  loading={false}
                  handleSubmit={() =>
                    setBioUserSchoolInfoForm('inSchool', true)
                  }
                  style={bioUserSchoolForm.inSchool ? '' : 'outline'}
                />
              </View>
              <View className="w-1/2 px-2">
                <CustomBtn
                  label="No"
                  loading={false}
                  handleSubmit={() =>
                    setBioUserSchoolInfoForm('inSchool', false)
                  }
                  style={bioUserSchoolForm.inSchool === false ? '' : 'outline'}
                />
              </View>
            </View>
            {bioUserSchoolForm.inSchool === false && (
              <CustomBtn
                label="Continue"
                loading={false}
                handleSubmit={handleSubmit}
              />
            )}
          </View>

          {bioUserSchoolForm.inSchool && (
            <View className="mb-6">
              <Text className="uppercase text-center mb-5 text-secondary dark:text-dark-secondary">
                set current Place of study
              </Text>
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
                type="state"
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
                type="area"
                placeholder={
                  bioUserSchoolForm.schoolArea
                    ? bioUserSchoolForm.schoolArea
                    : 'Select Area'
                }
                onSelect={selectArea}
                disabled={!bioUserSchoolForm.schoolState}
                errorMessage={
                  !bioUserSchoolForm.schoolState
                    ? 'Please select school state first to continue.'
                    : undefined
                }
              />
            </View>
          )}

          {academicResults.length > 0 && bioUserSchoolForm.schoolCountry && (
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

          {bioUserSchoolForm.schoolAcademicLevel &&
            bioUserSchoolForm.schoolAcademicLevel.levelName !== '' &&
            bioUserSchoolForm.schoolState && (
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

                {bioUserSchoolForm.schoolName && (
                  <View className="flex-row w-full items-center py-3 px-2 border-b border-b-border dark:border-b-dark-border">
                    {bioUserSchoolForm.schoolLogo && (
                      <Image
                        source={{ uri: String(bioUserSchoolForm.schoolLogo) }}
                        style={{ width: 30, height: 20, marginRight: 10 }}
                      />
                    )}
                    <Text className="text-xl flex-1 text-primary dark:text-dark-primary">
                      {bioUserSchoolForm.schoolName}
                    </Text>
                  </View>
                )}
              </View>
            )}

          {bioUserSchoolForm.schoolName && isAdvanced && (
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

              {bioUserSchoolForm.schoolDepartment && (
                <View className="flex-row w-full items-center py-3 px-2 border-b border-b-border dark:border-b-dark-border">
                  <Text className="text-xl flex-1 text-primary dark:text-dark-primary">
                    {bioUserSchoolForm.schoolDepartment}
                  </Text>
                </View>
              )}
            </View>
          )}

          {((isAdvanced &&
            bioUserSchoolForm.schoolDepartment &&
            bioUserSchoolForm.schoolName) ||
            (!isAdvanced && bioUserSchoolForm.schoolName)) && (
            <>
              <View className="mb-8 mt-2">
                <Text className="uppercase text-center mb-3 text-secondary dark:text-dark-secondary">
                  set year of admission
                </Text>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => setCalendarVisible(true)}
                >
                  <Calendar size={20} color={isDark ? '#6E6E6E' : '#BABABA'} />
                  <Text className="text-primary dark:text-dark-primary text-xl mx-3">
                    Year of Admission:
                  </Text>
                  <Text className="text-custom text-xl">
                    {bioUserSchoolForm.admittedAt
                      ? dayjs(bioUserSchoolForm.admittedAt).format(
                          'DD MMM YYYY'
                        )
                      : 'Select Date'}
                  </Text>
                </TouchableOpacity>

                <PopupCalendar
                  visible={calendarVisible}
                  onClose={() => setCalendarVisible(false)}
                  onSelectDate={(date) =>
                    setBioUserSchoolInfoForm('admittedAt', date)
                  }
                />
              </View>

              <Text className="uppercase text-center mb-3 text-secondary dark:text-dark-secondary">
                set current year of study
              </Text>
              <View className="flex-row w-full flex-wrap mb-8">
                {maxLevels.map((item, index) => (
                  <View className="mr-4" key={index}>
                    <RadioButton
                      label={`${activeLevel.maxLevelName} ${item.level + 1}`}
                      selected={item.isActive}
                      onPress={() => selectMaxLevel(index)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          {bioUserSchoolForm.schoolName && (
            <CustomBtn
              label="Update Education Profile"
              loading={loading}
              handleSubmit={handleSubmit}
            />
          )}
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
