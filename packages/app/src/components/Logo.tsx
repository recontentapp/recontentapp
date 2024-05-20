import { FC } from 'react'

import { theme } from 'design-system'

interface LogoProps {
  size: number
  variation: 'white' | 'colorful'
  logoOnly?: boolean
}

const ratio = 604 / 111

export const Logo: FC<LogoProps> = ({ size, variation, logoOnly = false }) => {
  const height = Math.round(size / ratio)

  if (logoOnly) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 100C0 24 24 0 100 0s100 24 100 100-24 100-100 100S0 176 0 100Z"
          fill={
            variation === 'white' ? theme.colors.white : theme.colors.purple800
          }
        />
        <path
          fill={
            variation === 'white' ? theme.colors.purple800 : theme.colors.white
          }
          d="M42.4 94.8V42h52.8v52.8z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M104.8 42v120c33.137 0 60-26.863 60-60s-26.863-60-60-60ZM63.399 161.509l33.807-22.639C94.554 152.06 82.826 162 68.76 162c-1.832 0-3.624-.168-5.361-.491ZM47.085 152.34l47.675-31.926a28.452 28.452 0 0 1 2.841 9.677L55.05 158.586a29.079 29.079 0 0 1-7.964-6.246ZM90.842 114.523l-47.8 32.011A28.454 28.454 0 0 1 40 136.99l43.073-28.845a29.106 29.106 0 0 1 7.768 6.378ZM40.158 128.37c2.314-13.606 14.24-23.97 28.602-23.97 2.13 0 4.206.228 6.206.661L40.158 128.37Z"
          fill={
            variation === 'white' ? theme.colors.purple800 : theme.colors.white
          }
        />
      </svg>
    )
  }

  return (
    <svg
      aria-label="Recontent.app logo"
      width={size}
      height={height}
      viewBox="0 0 604 111"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={
          variation === 'white' ? theme.colors.white : theme.colors.purple800
        }
        d="M2 55V11h44v44z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M54 11v100c27.614 0 50-22.386 50-50S81.614 11 54 11ZM19.498 110.591l28.173-18.866C45.461 102.717 35.688 111 23.966 111c-1.527 0-3.02-.14-4.468-.409ZM5.903 102.95l39.73-26.605A23.713 23.713 0 0 1 48 84.409l-35.46 23.746a24.239 24.239 0 0 1-6.637-5.205ZM42.367 71.436 2.535 98.11A23.714 23.714 0 0 1 0 90.158l35.895-24.037a24.25 24.25 0 0 1 6.472 5.315ZM.131 82.975C2.06 71.637 11.997 63 23.966 63c1.775 0 3.505.19 5.171.55L.131 82.975Z"
        fill={
          variation === 'white' ? theme.colors.white : theme.colors.purple800
        }
      />
      <path
        d="M127.724 90V33.273h17.543v10.34h.591c1.034-3.742 2.721-6.524 5.06-8.346 2.339-1.847 5.059-2.77 8.162-2.77.837 0 1.698.062 2.585.185.886.098 1.711.258 2.474.48v15.696c-.862-.295-1.994-.53-3.398-.702-1.378-.172-2.609-.258-3.693-.258-2.142 0-4.075.48-5.798 1.44a10.348 10.348 0 0 0-4.026 3.952c-.96 1.674-1.44 3.644-1.44 5.909V90h-18.06Zm64.226 1.071c-5.934 0-11.055-1.17-15.364-3.508-4.284-2.364-7.583-5.725-9.898-10.083-2.29-4.383-3.434-9.59-3.434-15.622 0-5.86 1.157-10.981 3.471-15.364 2.315-4.407 5.577-7.83 9.787-10.267 4.21-2.462 9.172-3.693 14.884-3.693 4.038 0 7.731.628 11.079 1.884 3.349 1.255 6.242 3.114 8.679 5.576 2.438 2.462 4.333 5.503 5.688 9.123 1.354 3.594 2.031 7.718 2.031 12.372v4.505h-49.304V55.506h32.5c-.025-1.92-.48-3.632-1.367-5.134a9.281 9.281 0 0 0-3.656-3.508c-1.526-.862-3.287-1.293-5.281-1.293-2.019 0-3.829.456-5.429 1.367a10.054 10.054 0 0 0-3.804 3.656c-.936 1.526-1.428 3.262-1.477 5.207v10.673c0 2.315.455 4.346 1.366 6.094a9.855 9.855 0 0 0 3.878 4.026c1.674.96 3.669 1.44 5.983 1.44 1.6 0 3.053-.222 4.358-.665 1.305-.443 2.425-1.095 3.361-1.957.935-.862 1.637-1.92 2.105-3.176l16.582.48c-.689 3.718-2.203 6.955-4.542 9.713-2.315 2.733-5.355 4.863-9.123 6.39-3.767 1.501-8.125 2.252-13.073 2.252Zm59.507 0c-5.983 0-11.117-1.231-15.401-3.693-4.259-2.462-7.534-5.885-9.824-10.267-2.289-4.407-3.434-9.504-3.434-15.29 0-5.81 1.145-10.907 3.434-15.29 2.315-4.407 5.602-7.842 9.861-10.304 4.284-2.462 9.393-3.693 15.327-3.693 5.244 0 9.811.948 13.702 2.844 3.914 1.896 6.967 4.58 9.159 8.051 2.216 3.447 3.385 7.497 3.508 12.15h-16.878c-.344-2.905-1.329-5.182-2.954-6.832-1.601-1.65-3.693-2.474-6.279-2.474-2.092 0-3.927.59-5.503 1.772-1.575 1.158-2.806 2.881-3.693 5.17-.861 2.266-1.292 5.073-1.292 8.421 0 3.349.431 6.18 1.292 8.495.887 2.29 2.118 4.025 3.693 5.207 1.576 1.157 3.411 1.736 5.503 1.736 1.675 0 3.152-.357 4.432-1.071 1.305-.714 2.376-1.76 3.213-3.14.837-1.403 1.367-3.102 1.588-5.096h16.878c-.172 4.678-1.342 8.765-3.508 12.261-2.142 3.497-5.159 6.217-9.049 8.162-3.865 1.92-8.457 2.881-13.775 2.881Zm58.934 0c-5.958 0-11.079-1.219-15.363-3.656-4.26-2.462-7.547-5.885-9.861-10.267-2.29-4.407-3.435-9.516-3.435-15.327 0-5.835 1.145-10.944 3.435-15.327 2.314-4.407 5.601-7.83 9.861-10.267 4.284-2.462 9.405-3.693 15.363-3.693 5.959 0 11.068 1.231 15.327 3.693 4.284 2.438 7.571 5.86 9.861 10.267 2.314 4.383 3.472 9.492 3.472 15.327 0 5.81-1.158 10.92-3.472 15.327-2.29 4.382-5.577 7.805-9.861 10.267-4.259 2.437-9.368 3.656-15.327 3.656Zm.111-13.628c2.167 0 4.001-.665 5.503-1.994 1.502-1.33 2.647-3.176 3.435-5.54.812-2.364 1.218-5.097 1.218-8.199 0-3.151-.406-5.909-1.218-8.273-.788-2.363-1.933-4.21-3.435-5.54-1.502-1.329-3.336-1.994-5.503-1.994-2.24 0-4.136.665-5.687 1.995-1.527 1.33-2.696 3.176-3.509 5.54-.788 2.363-1.182 5.12-1.182 8.272 0 3.102.394 5.836 1.182 8.2.813 2.363 1.982 4.21 3.509 5.539 1.551 1.33 3.447 1.994 5.687 1.994Zm52.74-19.795V90h-18.06V33.273h17.173v10.414h.628c1.256-3.471 3.398-6.192 6.426-8.161 3.029-1.995 6.636-2.992 10.821-2.992 3.989 0 7.448.899 10.378 2.696 2.955 1.773 5.244 4.26 6.869 7.46 1.65 3.177 2.463 6.894 2.438 11.154V90h-18.06V57.39c.025-3.152-.775-5.614-2.4-7.387-1.601-1.773-3.829-2.66-6.685-2.66-1.896 0-3.57.42-5.023 1.256-1.428.813-2.536 1.982-3.324 3.509-.763 1.527-1.157 3.373-1.181 5.54Zm76.754-24.375v13.295h-35.787V33.273h35.787Zm-28.29-13.591h18.06v52.48c0 1.108.172 2.007.517 2.696a3.224 3.224 0 0 0 1.588 1.44c.689.271 1.514.406 2.474.406.69 0 1.416-.061 2.179-.184.788-.148 1.379-.27 1.773-.37l2.733 13.037a84.06 84.06 0 0 1-3.656.924c-1.551.37-3.41.603-5.577.701-4.235.198-7.866-.295-10.895-1.477-3.004-1.206-5.306-3.077-6.906-5.613-1.576-2.536-2.339-5.725-2.29-9.566V19.682Zm60.292 71.389c-5.934 0-11.055-1.17-15.364-3.508-4.284-2.364-7.583-5.725-9.897-10.083-2.29-4.383-3.435-9.59-3.435-15.622 0-5.86 1.157-10.981 3.472-15.364 2.314-4.407 5.576-7.83 9.787-10.267 4.21-2.462 9.171-3.693 14.883-3.693 4.038 0 7.731.628 11.08 1.884 3.348 1.255 6.241 3.114 8.679 5.576 2.437 2.462 4.333 5.503 5.687 9.123 1.354 3.594 2.031 7.718 2.031 12.372v4.505h-49.304V55.506h32.5c-.024-1.92-.48-3.632-1.366-5.134a9.281 9.281 0 0 0-3.656-3.508c-1.527-.862-3.287-1.293-5.282-1.293-2.019 0-3.828.456-5.429 1.367a10.054 10.054 0 0 0-3.804 3.656c-.935 1.526-1.428 3.262-1.477 5.207v10.673c0 2.315.456 4.346 1.367 6.094a9.852 9.852 0 0 0 3.877 4.026c1.675.96 3.669 1.44 5.983 1.44 1.601 0 3.053-.222 4.358-.665 1.305-.443 2.426-1.095 3.361-1.957.936-.862 1.637-1.92 2.105-3.176l16.583.48c-.69 3.718-2.204 6.955-4.543 9.713-2.314 2.733-5.355 4.863-9.122 6.39-3.767 1.501-8.125 2.252-13.074 2.252Zm51.087-33.423V90h-18.06V33.273h17.173v10.414h.628c1.256-3.471 3.398-6.192 6.426-8.161 3.029-1.995 6.636-2.992 10.821-2.992 3.989 0 7.448.899 10.378 2.696 2.955 1.773 5.245 4.26 6.87 7.46 1.649 3.177 2.462 6.894 2.437 11.154V90h-18.06V57.39c.025-3.152-.775-5.614-2.4-7.387-1.601-1.773-3.829-2.66-6.685-2.66-1.896 0-3.57.42-5.023 1.256-1.428.813-2.536 1.982-3.323 3.509-.764 1.527-1.158 3.373-1.182 5.54Zm76.754-24.375v13.295h-35.787V33.273h35.787Zm-28.29-13.591h18.06v52.48c0 1.108.172 2.007.517 2.696a3.228 3.228 0 0 0 1.588 1.44c.689.271 1.514.406 2.474.406.69 0 1.416-.061 2.179-.184.788-.148 1.379-.27 1.773-.37l2.733 13.037c-.862.247-2.08.555-3.656.924-1.551.37-3.41.603-5.577.701-4.235.198-7.866-.295-10.895-1.477-3.004-1.206-5.306-3.077-6.906-5.613-1.576-2.536-2.339-5.725-2.29-9.566V19.682Z"
        fill={variation === 'white' ? theme.colors.white : theme.colors.gray14}
      />
    </svg>
  )
}
