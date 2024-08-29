import { extendTheme } from "@chakra-ui/react";

const mainTheme = extendTheme({
  fonts: {
    heading: "'Source Sans 3', 'sans-serif'",
    body: "'Source Sans 3', 'sans-serif'",
  },
  colors: {
    jambonz: {
      0: "#EDDEE3",
      50: "#ffe1f1",
      100: "#ffb3c6",
      200: "#fc839d",
      300: "#fa5575",
      400: "#f8274e",
      500: "#BB225B",
      550: "#DA1C5C",
      600: "#c60921",
      700: "#99081a",
      800: "#6c0714",
      900: "#44060d",
    },
    grey: {
      50: "#FFFFFF",
      75: "#F9F9F9",
      100: "#F5F5F5",
      200: "#ECECEC",
      300: "#E3E3E3",
      400: "#D9D9D9",
      500: "#EBEBEB",
      600: "#BFBFBF",
      700: "#969696",
      800: "#6D6D6D",
      900: "#434343",
    },
    blue: {
      600: "#4492FF", //for toggle icon
    },
  },
  components: {
    FormLabel: {
      baseStyle: {
        _parent: { name: "form" },
        fontSize: "14px",
        fontWeight: "normal",
      },
    },
    Input: {
      baseStyle: {
        field: {
          _parent: { name: "form" },
          fontSize: "14px",
          fontWeight: "bold",
        },
      },
    },
  },
});

export const colors = {
  //to use outside of chakra component
  jambonz: "#DA1C5C",
};

export default mainTheme;
