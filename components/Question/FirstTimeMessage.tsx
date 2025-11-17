import { View, Text, ScrollView } from 'react-native'

const FirstTimeMessage = () => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-secondary dark:bg-dark-secondary px-3 py-10"
    >
      <View
        className={`items-center pb-1 mb-5 relative border-b border-b-border dark:border-b-dark-border`}
      >
        <Text className="text-secondary dark:text-dark-secondary text-center text-xl mb-2">
          Important Notice Before You Begin
        </Text>
        <Text className="text-primary leading-[20px] text-center dark:text-dark-primaryLight">
          Please read the online-test policy carefully before you begin this
          exercise, if you are comfortable you can click the play button at the
          bottom left to start. Else, click the exit button at your bottom right
          to exit this page.
        </Text>
      </View>
      <View className="bg-primary dark:bg-dark-primary rounded-[10px] p-3">
        <Text className="text-primary text-justify text-lg dark:text-dark-primary">
          In our effort to create a simple and academic platform where exam
          canditiates can test/practice with available past questions, we record
          every exercise performed by users, whether casual or formal. We do
          this simply to improve user experience, therefore we hope you are
          prepared for this test before you start. Once you begin and decides to
          end by any means, your progress will be scored as though you have
          completed the exercise.{' '}
          <Text className="text-custom">
            Above all, feel free to prepare for as many exams as available on
            this platform, thanks.
          </Text>
        </Text>
      </View>
    </ScrollView>
  )
}

export default FirstTimeMessage
