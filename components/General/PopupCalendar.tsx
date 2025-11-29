import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native'
import Modal from 'react-native-modal'
import dayjs, { Dayjs } from 'dayjs'

interface PopupCalendarProps {
  visible: boolean
  onClose: () => void
  onSelectDate: (date: Date) => void
}

const PopupCalendar: React.FC<PopupCalendarProps> = ({
  visible,
  onClose,
  onSelectDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs())
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  const daysInMonth = currentMonth.daysInMonth()
  const firstDay = currentMonth.startOf('month').day()
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const nextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'))
  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'))

  const toggleYearDropdown = () => setShowYearDropdown(!showYearDropdown)

  const handleSelectYear = (year: number) => {
    setCurrentMonth(currentMonth.year(year))
    setShowYearDropdown(false)
  }

  const renderDay = (day: number) => {
    const selectedDate = currentMonth.date(day)
    return (
      <TouchableOpacity
        key={day}
        style={styles.day}
        onPress={() => {
          onSelectDate(selectedDate.toDate())
          onClose()
        }}
      >
        <Text className="text-primary dark:text-dark-primary">{day}</Text>
      </TouchableOpacity>
    )
  }

  // Generate years range: 1900 - 2100
  const years = Array.from({ length: 201 }, (_, i) => 1900 + i)

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.4}
    >
      <View
        className="bg-primary dark:bg-dark-primary"
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth}>
            <Text className="text-xl p-3 text-primary dark:text-dark-primary">
              ◀
            </Text>
          </TouchableOpacity>

          <View>
            <TouchableOpacity onPress={toggleYearDropdown}>
              <Text className="text-xl font-psemibold text-secondary dark:text-dark-secondary">
                {currentMonth.format('MMMM')} {currentMonth.year()} ▼
              </Text>
            </TouchableOpacity>

            {showYearDropdown && (
              <View style={styles.yearDropdown}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={styles.yearItem}
                      onPress={() => handleSelectYear(year)}
                    >
                      <Text
                        style={[
                          styles.yearText,
                          year === currentMonth.year() && {
                            fontWeight: 'bold',
                          },
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <TouchableOpacity onPress={nextMonth}>
            <Text className="text-xl p-3 text-primary dark:text-dark-primary">
              ▶
            </Text>
          </TouchableOpacity>
        </View>

        {/* Week Row */}
        <View style={styles.weekRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <Text key={d} style={styles.weekText}>
              {d}
            </Text>
          ))}
        </View>

        {/* Days Grid */}
        <View style={styles.daysGrid}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.day} />
          ))}

          {daysArray.map(renderDay)}
        </View>
      </View>
    </Modal>
  )
}

export default PopupCalendar

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    alignItems: 'center',
  },

  monthText: {
    fontSize: 20,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekText: {
    width: 36,
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  day: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  dayText: {
    fontSize: 16,
  },
  yearDropdown: {
    position: 'absolute',
    top: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 5,
    width: 100,
    zIndex: 100,
  },
  yearItem: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  yearText: {
    fontSize: 16,
  },
})
