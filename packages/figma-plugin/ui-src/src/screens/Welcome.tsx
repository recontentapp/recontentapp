import { Box, Button, Text, Stack } from 'figma-ui-kit'

interface WelcomeProps {
  onGetStarted: () => void
}

export const Welcome = ({ onGetStarted }: WelcomeProps) => {
  return (
    <Stack
      width="100%"
      height="100%"
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing="$extraLarge"
    >
      <Stack direction="column" alignItems="center" spacing="$large">
        <svg
          width={48}
          height={48}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M100 0C24 0 0 24 0 100s24 100 100 100 100-24 100-100S176 0 100 0ZM42.4 42v52.8h52.8V42H42.4Zm122.4 60c0 33.137-26.863 60-60 60V42c33.137 0 60 26.863 60 60ZM63.399 161.509l33.807-22.639C94.554 152.06 82.826 162 68.76 162c-1.832 0-3.624-.168-5.361-.491Zm31.36-41.095L47.086 152.34a29.08 29.08 0 0 0 7.964 6.246l42.552-28.495a28.452 28.452 0 0 0-2.841-9.677Zm-3.917-5.891-47.8 32.011A28.454 28.454 0 0 1 40 136.99l43.073-28.845a29.106 29.106 0 0 1 7.768 6.378ZM68.76 104.4c-14.363 0-26.288 10.364-28.602 23.97l34.808-23.309c-2-.433-4.076-.661-6.206-.661Z"
            fill="#fff"
          />
        </svg>

        <Box display="flex" alignItems="center" justifyContent="center">
          <Box maxWidth={240}>
            <Text align="center">
              Recontent.app helps product teams collaborate on product copy &
              localization.
            </Text>
          </Box>
        </Box>
      </Stack>

      <Button onClick={onGetStarted}>Get started with Recontent.app</Button>
    </Stack>
  )
}
