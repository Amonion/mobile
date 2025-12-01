import { View, Text, useColorScheme, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm, formatDate } from '@/lib/helpers'
import { BioUserStore } from '@/store/user/BioUser'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import { useRouter } from 'expo-router'
import { ValidationResult } from '@/lib/validateAuthInputs'
import { RadioButton } from '@/components/General/RadioButton'
import InputField from '@/components/General/InputField'
import FaceCaptureBox from '@/components/Verification/FaceCaptureBox'
import CustomBtn from '@/components/General/CustomBtn'
import PopupCalendar from '@/components/General/PopupCalendar'
import dayjs from 'dayjs'
import { Calendar } from 'lucide-react-native'

export default function VerificationBioSettings() {
  const { bioUserForm, setForm, setBioUser, updateMyBioUser, loading } =
    BioUserStore()
  const { bioUserState, user, bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark' ? true : false
  const [isBioEdit, setIsBioEdit] = useState(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const [calendarVisible, setCalendarVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const url = '/users/bio-user/'
  const router = useRouter()

  useEffect(() => {
    if (bioUserState?.isBio) {
      setIsBioEdit(false)
    } else {
      setIsBioEdit(true)
    }
  }, [bioUserState])

  useEffect(() => {
    if (isBioEdit && bioUser) {
      setBioUser(bioUser)
    }
  }, [isBioEdit, bioUser])

  const handleSubmit = async () => {
    // const passport: FileLike = {
    //   uri: String(passportImage),
    //   name: 'passport.jpg',
    //   type: 'image/jpeg',
    // }
    // const inputsToValidate = [
    //   {
    //     name: 'ID',
    //     value: String(user?._id),
    //     rules: { blank: true, maxLength: 100 },
    //     field: 'User Id',
    //   },
    //   {
    //     name: 'firstName',
    //     value: userInfoForm.firstName.trim(),
    //     rules: { blank: false, maxLength: 120 },
    //     field: 'First Name',
    //   },
    //   {
    //     name: 'middleName',
    //     value: userInfoForm.middleName.trim(),
    //     rules: { blank: false, maxLength: 60 },
    //     field: 'Middle Name',
    //   },
    //   {
    //     name: 'lastName',
    //     value: userInfoForm.lastName.trim(),
    //     rules: { blank: false, maxLength: 60 },
    //     field: 'Last Name',
    //   },
    //   {
    //     name: 'gender',
    //     value: userInfoForm.gender.trim(),
    //     rules: { blank: false, maxLength: 60 },
    //     field: 'Gender',
    //   },
    //   {
    //     name: 'maritalStatus',
    //     value: userInfoForm.maritalStatus,
    //     rules: { blank: false, maxLength: 60 },
    //     field: 'Marital Status',
    //   },
    //   {
    //     name: 'dob',
    //     value: String(userInfoForm.dob),
    //     rules: { blank: true, maxLength: 100 },
    //     field: 'Date of Birth',
    //   },
    //   {
    //     name: 'passport',
    //     value: passportImage === null ? null : passport,
    //     rules: { blank: false, maxSize: 10 },
    //     field: 'Passport Picture',
    //   },
    //   {
    //     name: 'isBio',
    //     value: true,
    //     rules: { blank: true },
    //     field: 'Is Bio',
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
    //   'You will need to contact support to edit this information after verification!',
    //   true,
    //   () => submitData(data)
    // )
  }

  const handleInputChange = (name: string, value: string) => {
    setForm(name as keyof typeof bioUserForm, value)
  }

  const submitData = async (data: FormData) => {
    // updateMyBioUser(`${url}${bioUser?._id}`, data, setMessage, () =>
    //   router.push(`/home/verification/origin`)
    // )
  }

  return (
    <>
      {isBioEdit ? (
        <View className={`flex-1 px-3`}>
          <InputField
            label="First Name"
            value={bioUserForm.firstName}
            placeholder="Enter first name"
            error={error?.emailMessage}
            autoCapitalize="words"
            onChangeText={(e) => handleInputChange(e, 'firstName')}
          />
          <InputField
            label="Middle Name"
            value={bioUserForm.middleName}
            placeholder="Enter middle name"
            error={error?.emailMessage}
            autoCapitalize="words"
            onChangeText={(e) => handleInputChange(e, 'middleName')}
          />
          <InputField
            label="Last Name"
            value={bioUserForm.lastName}
            placeholder="Enter last name"
            error={error?.emailMessage}
            autoCapitalize="words"
            onChangeText={(e) => handleInputChange(e, 'lastName')}
          />

          <View className="mb-8 mt-2">
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => setCalendarVisible(true)}
            >
              <Calendar size={20} color={isDark ? '#6E6E6E' : '#BABABA'} />
              <Text className="text-primary dark:text-dark-primary text-xl mx-3">
                Date of Birth:
              </Text>
              <Text className="text-custom text-xl">
                {selectedDate
                  ? dayjs(selectedDate).format('DD MMM YYYY')
                  : 'Select Date'}
              </Text>
            </TouchableOpacity>

            <PopupCalendar
              visible={calendarVisible}
              onClose={() => setCalendarVisible(false)}
              onSelectDate={(date) => setSelectedDate(date)}
            />
          </View>

          <View className="flex-row flex-wrap justify-between">
            <View className="mb-4 ">
              <Text className="text-lg text-primary dark:text-dark-primary mb-2">
                Select Gender
              </Text>
              <View className="flex-row">
                <RadioButton
                  label="Male"
                  selected={bioUserForm.gender === 'Male'}
                  onPress={() => setForm('gender', 'Male')}
                />
                <View className="mx-1" />
                <RadioButton
                  label="Female"
                  selected={bioUserForm.gender === 'Female'}
                  onPress={() => setForm('gender', 'Female')}
                />
              </View>
            </View>

            <View className="mb-4 ">
              <Text className="text-lg text-primary dark:text-dark-primary mb-2">
                Marital Status
              </Text>
              <View className="flex-row">
                <RadioButton
                  label="Single"
                  selected={bioUserForm.maritalStatus === 'Single'}
                  onPress={() => setForm('maritalStatus', 'Single')}
                />
                <View className="mx-1" />
                <RadioButton
                  label="Married"
                  selected={bioUserForm.maritalStatus === 'Married'}
                  onPress={() => setForm('maritalStatus', 'Married')}
                />
              </View>
            </View>
          </View>

          <FaceCaptureBox />

          <CustomBtn
            label="Update Profile"
            loading={loading}
            handleSubmit={handleSubmit}
          />
          <View className="my-2" />
          {isBioEdit && bioUserState?.isBio && (
            <CustomBtn
              label="Cancle Edit"
              loading={loading}
              handleSubmit={handleSubmit}
              style="outline"
            />
          )}
        </View>
      ) : (
        <View className="px-3 flex-1 mb-5">
          <View className="px-3 z-30 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]">
            <View className="py-2 border-b border-b-border dark:border-b-dark-border mb-5">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                First Name
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.firstName}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Middle Name
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.middleName}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Last Name
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.lastName}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Date of Birth
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {formatDate(String(bioUserForm.dateOfBirth))}
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap justify-start py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <View className="mb-4 mr-[40px]">
                <Text className="text-lg text-primaryLight dark:text-dark-primaryLight mb-2">
                  Gender
                </Text>
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.gender}
                </Text>
              </View>
              <View className="mb-4 mx-2">
                <Text className="text-lg text-primaryLight dark:text-dark-primaryLight mb-2">
                  Marital Status
                </Text>
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.maritalStatus}
                </Text>
              </View>
            </View>

            {/* <FaceCaptureBox onPhotoTaken={setPhotoUri} /> */}

            <CustomBtn
              label="Edit Bio"
              loading={loading}
              handleSubmit={handleSubmit}
              style="outline"
            />
          </View>
        </View>
      )}
    </>
  )
}
