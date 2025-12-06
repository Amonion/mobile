import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import AreaStore from '@/store/place/AreaOrigin'
import { useRouter } from 'expo-router'
import { BioUserStore } from '@/store/user/BioUser'
import { Area } from '@/store/place/Area'
import CustomDropdown from '@/components/General/CustomDropdown'
import InputField from '@/components/General/InputField'
import CustomBtn from '@/components/General/CustomBtn'
import CountryStore from '@/store/place/Country'
import StateStore from '@/store/place/State'

export default function VerificationOriginSettings() {
  const { bioUserForm, setForm, loading, updateMyBioUser } = BioUserStore()
  const { user, bioUser, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const url = '/users/bio-user/'
  const router = useRouter()
  const [isCEdit, setCEdit] = useState(false)
  const { area, getArea } = AreaStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()

  useEffect(() => {
    if (!bioUserState) return
    if (!bioUserState.isContact) {
      setCEdit(true)
    } else {
      setCEdit(false)
    }
  }, [bioUserState])

  useEffect(() => {
    if (!bioUser) return
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
    BioUserStore.setState({ bioUserForm: bioUser })
  }, [bioUser])

  useEffect(() => {
    if (bioUser?.residentCountry) {
      getStates(
        `/places/state/?country=${bioUser.residentCountry}&page_size=350&field=state&sort=state`,
        setMessage
      )
    }
  }, [bioUser])

  useEffect(() => {
    if (bioUser?.residentState) {
      getArea(
        `/places/area/?state=${bioUser.residentState}&page_size=350&field=area&sort=area`
      )
    }
  }, [bioUser])

  const selectCountry = (country: Area) => {
    setForm('residentContinent', country.continent)
    setForm('residentCountry', country.country)
    setForm('residentCountryFlag', String(country.countryFlag))
    setForm('residentCountrySymbol', country.countrySymbol)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    setForm('residentState', '')
  }

  const selectState = (state: Area) => {
    setForm('residentState', state.state)
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
  }

  const selectArea = (area: Area) => {
    setForm('residentArea', area.area)
    setForm('residentPlaceId', area.id)
  }

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUser?._id}`, data, () =>
      router.replace(`/home/verification/related`)
    )
  }

  const handleSubmit = async () => {
    if (user && user.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'residentContinent',
        value: bioUserForm.residentContinent,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Resident continent name',
      },
      {
        name: 'residentCountry',
        value: bioUserForm.residentCountry,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Resident country name',
      },
      {
        name: 'residentCountryFlag',
        value: bioUserForm.residentCountryFlag,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Flag',
      },
      {
        name: 'residentCountrySymbol',
        value: bioUserForm.residentCountrySymbol,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Country symbol',
      },
      {
        name: 'residentState',
        value: bioUserForm.residentState,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Resident state name',
      },
      {
        name: 'residentArea',
        value: bioUserForm.residentArea,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Resident area name',
      },
      {
        name: 'residentAddress',
        value: bioUserForm.residentAddress,
        rules: { blank: true, minLength: 3, maxLength: 500 },
        field: 'Resident address',
      },
      {
        name: 'residentId',
        value: bioUserForm.residentPlaceId,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Place ID',
      },
      {
        name: 'phone',
        value: bioUserForm.phone,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Phone name',
      },
      {
        name: 'action',
        value: 'Contact',
        rules: { blank: true, minLength: 1 },
        field: 'Bio Data',
      },
      {
        name: 'isContact',
        value: true,
        rules: { blank: false, maxLength: 100 },
        field: 'isContact',
      },
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true },
        field: 'ID ',
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

  return (
    <>
      {isCEdit ? (
        <View className={`flex-1 px-3 min-h-[400px]`}>
          <CustomDropdown
            data={countries}
            label="Select Country"
            placeholder={
              bioUserForm.residentCountry
                ? bioUserForm.residentCountry
                : 'Select Country'
            }
            onSelect={selectCountry}
          />
          <CustomDropdown
            data={states}
            label="Select State"
            placeholder={
              bioUserForm.residentState
                ? bioUserForm.residentState
                : 'Select State'
            }
            disabled={!bioUserForm.residentCountry}
            type="state"
            errorMessage={
              !bioUserForm.residentCountry
                ? 'Please select country first to continue.'
                : undefined
            }
            onSelect={(value) => selectState(value)}
          />
          <CustomDropdown
            data={area}
            label="Select Area"
            placeholder={
              bioUserForm.residentArea
                ? bioUserForm.residentArea
                : 'Select Area'
            }
            disabled={!bioUserForm.residentState}
            type="area"
            errorMessage={
              !bioUserForm.homeState
                ? 'Please select state first to continue.'
                : undefined
            }
            onSelect={(value) => selectArea(value)}
          />
          <InputField
            label="Residence Address"
            value={bioUserForm.residentAddress}
            placeholder="Enter residential address"
            autoCapitalize="words"
            onChangeText={(e) => setForm('residentAddress', e)}
          />
          <InputField
            label="Phone Number"
            value={bioUserForm.phone}
            placeholder="Enter your phone number"
            autoCapitalize="words"
            onChangeText={(e) => setForm('phone', e)}
          />

          <CustomBtn
            label="Update Profile"
            loading={loading}
            handleSubmit={handleSubmit}
          />

          <View className="my-2" />
          {isCEdit && bioUserState?.isContact && (
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
          <View className="px-3 pb-3 z-30 w-full overflow-auto border border-border dark:border-dark-border rounded-[10px]">
            <View className="py-2 border-b border-b-border dark:border-b-dark-border mb-5">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Address of Residence
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.residentAddress}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Area of Residence
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.residentArea}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                State of Residence
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.residentState}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Country of Residence
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.residentCountry}
                </Text>
              </View>
            </View>
            <CustomBtn
              label="Edit Bio"
              loading={loading}
              handleSubmit={() => {
                setCEdit(true)
              }}
              style="outline"
            />
          </View>
        </View>
      )}
    </>
  )
}
