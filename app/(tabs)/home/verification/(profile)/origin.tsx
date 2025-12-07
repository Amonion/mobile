import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validateInputs'
import { appendForm } from '@/lib/helpers'
import { AuthStore } from '@/store/AuthStore'
import { AlartStore, MessageStore } from '@/store/notification/Message'
import AreaStore from '@/store/place/AreaOrigin'
import { useRouter } from 'expo-router'
import { BioUserStore } from '@/store/user/BioUser'
import CountryStore from '@/store/place/CountryOrigin'
import StateStore, { State } from '@/store/place/StateOrigin'
import { Area } from '@/store/place/Area'
import CustomDropdown from '@/components/General/CustomDropdown'
import InputField from '@/components/General/InputField'
import CustomBtn from '@/components/General/CustomBtn'

export default function VerificationOriginSettings() {
  const { bioUserForm, setForm, loading, updateMyBioUser } = BioUserStore()
  const { user, bioUser, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const url = '/users/bio-user/'
  const router = useRouter()
  const [isOEdit, setOEdit] = useState(false)
  const { getArea, area } = AreaStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()

  useEffect(() => {
    if (!bioUserState) return
    if (!bioUserState.isOrigin) {
      setOEdit(true)
    } else {
      setOEdit(false)
    }
  }, [bioUserState])

  useEffect(() => {
    if (!bioUser) return
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`
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
  }, [bioUser?.residentCountry])

  useEffect(() => {
    if (bioUser?.residentState) {
      getArea(
        `/places/area/?state=${bioUser.residentState}&page_size=350&field=area&sort=area`
      )
    }
  }, [bioUser?.residentState])

  const selectCountry = (country: Area) => {
    setForm('homeContinent', country.continent)
    setForm('homeCountry', country.country)
    setForm('homeCountryFlag', String(country.countryFlag))
    setForm('homeCountrySymbol', country.countrySymbol)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    setForm('homeState', '')
  }

  const selectState = (state: State) => {
    setForm('homeState', state.state)
    setForm('homeArea', '')
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
  }

  const selectArea = (area: Area) => {
    setForm('homeArea', area.area)
    setForm('homePlaceId', area.id)
  }

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUser?._id}`, data, () =>
      router.replace(`/home/verification/contact`)
    )
  }

  const handleSubmit = async () => {
    if (user && user.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'homeContinent',
        value: bioUserForm.homeContinent,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Home continent name',
      },
      {
        name: 'homeCountry',
        value: bioUserForm.homeCountry,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Home country name',
      },
      {
        name: 'homeCountryFlag',
        value: bioUserForm.homeCountryFlag,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Flag',
      },
      {
        name: 'homeCountrySymbol',
        value: bioUserForm.homeCountrySymbol,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Country symbol',
      },
      {
        name: 'homeState',
        value: bioUserForm.homeState,
        rules: { blank: false, minLength: 2, maxLength: 100 },
        field: 'Home state name',
      },
      {
        name: 'homeArea',
        value: bioUserForm.homeArea,
        rules: { blank: false, minLength: 2, maxLength: 100 },
        field: 'Home area name',
      },
      {
        name: 'homeAddress',
        value: bioUserForm.homeAddress,
        rules: { blank: false, minLength: 3, maxLength: 500 },
        field: 'Home address',
      },
      {
        name: 'homeId',
        value: bioUserForm.homePlaceId,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Place ID',
      },
      {
        name: 'action',
        value: 'Origin',
        rules: { blank: true, minLength: 1 },
        field: 'Bio Data',
      },
      {
        name: 'isOrigin',
        value: true,
        rules: { blank: false, maxLength: 100 },
        field: 'isOrigin',
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
      {isOEdit ? (
        <View className={`flex-1 px-3 min-h-[400px]`}>
          <CustomDropdown
            data={countries}
            label="Select Country"
            placeholder={
              bioUserForm.homeCountry
                ? bioUserForm.homeCountry
                : 'Select Country'
            }
            onSelect={selectCountry}
          />
          <CustomDropdown
            data={states}
            label="Select State"
            placeholder={
              bioUserForm.homeState ? bioUserForm.homeState : 'Select State'
            }
            disabled={!bioUserForm.homeCountry}
            type="state"
            errorMessage={
              !bioUserForm.homeCountry
                ? 'Please select country first to continue.'
                : undefined
            }
            onSelect={(value) => selectState(value)}
          />
          <CustomDropdown
            data={area}
            label="Select Area"
            placeholder={
              bioUserForm.homeArea ? bioUserForm.homeArea : 'Select Area'
            }
            disabled={!bioUserForm.homeState}
            type="area"
            errorMessage={
              !bioUserForm.homeState
                ? 'Please select state first to continue.'
                : undefined
            }
            onSelect={(value) => selectArea(value)}
          />
          <InputField
            label="Home Address"
            value={bioUserForm.homeAddress}
            placeholder="Enter last name"
            autoCapitalize="words"
            onChangeText={(e) => setForm('homeAddress', e)}
          />

          <CustomBtn
            label="Update Profile"
            loading={loading}
            handleSubmit={handleSubmit}
          />

          <View className="my-2" />
          {isOEdit && bioUserState?.isOrigin && (
            <CustomBtn
              label="Cancle Edit"
              loading={false}
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
                Address of Origin
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.homeAddress}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Area of Origin
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.homeArea}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                State of Origin
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.homeState}
                </Text>
              </View>
            </View>
            <View className="py-2 mb-4 border-b border-b-border dark:border-b-dark-border">
              <Text className="text-lg text-primary dark:text-dark-primary mb-1">
                Country of Origin
              </Text>
              <View className="flex-row">
                <Text className="text-xl text-secondary dark:text-dark-secondary">
                  {bioUserForm.homeCountry}
                </Text>
              </View>
            </View>
            <CustomBtn
              label="Edit Bio"
              loading={false}
              handleSubmit={() => {
                setOEdit(true)
              }}
              style="outline"
            />
          </View>
        </View>
      )}
    </>
  )
}
