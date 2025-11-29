import { create } from 'zustand'
import _debounce from 'lodash/debounce'
import { customRequest } from '@/lib/api'
import { User } from '../user/User'
import { AuthStore } from '../AuthStore'
import { clearTable, getAll, saveAll, upsert } from '@/lib/localStorage/db'
import { isEqual } from 'lodash'

interface PeopleState {
  people: User[]
  count: number
  loading: boolean
  page: number
  page_size: number
  searchedPeople: User[]
  searchedPeopleResults: User[]
  getSavedPeople: (user: User) => Promise<void>
  getPeople: (url: string) => Promise<void>
  searchPeople: (url: string) => void
}

export const PeopleStore = create<PeopleState>((set) => ({
  people: [],
  count: 0,
  loading: false,
  page: 1,
  page_size: 20,
  searchedPeople: [],
  searchedPeopleResults: [],
  getSavedPeople: async (user) => {
    try {
      set({ loading: true })
      const people = await getAll<User>('people', { page: 1, pageSize: 20 })
      if (people.length > 0) {
        set({ people })
      }
      clearTable('people')
      PeopleStore.getState().getPeople(`/users/people/?page_size=40&page=1`)
    } catch (error: unknown) {
      console.log(error)
    } finally {
      set({ loading: false })
    }
  },

  getPeople: async (url: string) => {
    try {
      const response = await customRequest({ url })
      const data = response?.data
      if (data) {
        const fetchedPeople = data.results
        const savedPeople = PeopleStore.getState().people
        const first20Fetched = fetchedPeople.slice(0, 20)

        const missingPeople = first20Fetched.filter(
          (apiUser: User) =>
            !savedPeople.some((local) => local._id === apiUser._id)
        )

        let updatedSavedPeople = savedPeople

        if (missingPeople.length > 0) {
          updatedSavedPeople = [...savedPeople, ...missingPeople]
          set({ people: updatedSavedPeople })
          console.log(
            `📌 Added ${missingPeople.length} new people from first 20 fetched people.`
          )
        }

        if (savedPeople.length > 0) {
          const toUpsert = fetchedPeople.filter((apiItem: User) => {
            const existing = savedPeople.find(
              (localItem) => localItem._id === apiItem._id
            )
            return !existing || !isEqual(existing, apiItem)
          })

          if (toUpsert.length > 0) {
            for (const item of toUpsert) {
              await upsert('people', item)
            }
          } else {
            console.log('No new people to upsert.')
          }
        } else {
          saveAll('people', fetchedPeople)
          set({ people: fetchedPeople })
        }
      }
    } catch (error: unknown) {
      console.log(error)
    }
  },

  searchPeople: _debounce(async (url: string) => {
    try {
      const response = await customRequest({ url })
      if (response) {
        const { results } = response?.data
        const updatedResults = results.map((item: User) => ({
          ...item,
          isChecked: false,
          isActive: false,
        }))
        set({ searchedPeople: updatedResults })
      }
    } catch (error: unknown) {
      console.log(error)
    }
  }, 1000),

  updateUser: async (
    url: string,
    updatedItem: FormData | Record<string, unknown>,
    redirect?: () => void
  ) => {
    set({ loading: true })
    const response = await customRequest({
      url,
      method: 'PATCH',
      showMessage: true,
      data: updatedItem,
    })
    const data = response?.data
    if (data) {
      AuthStore.getState().setUser(data.data)
      if (redirect) redirect()
    }
  },
}))
