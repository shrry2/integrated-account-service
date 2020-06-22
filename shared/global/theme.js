const primaryGreen = '#00a960';

const theme = {
  colors: {
    link: '#4169e1',
  },
  base: {
    default: primaryGreen,
    focus: '#4169e1',
  },
  form: {
    input: primaryGreen,
    button: {
      default: {
        bg: '#fff',
        border: primaryGreen,
        text: primaryGreen,
        hoverBg: primaryGreen,
        hoverBorder: primaryGreen,
        hoverText: '#fff',
      },
      primary: {
        bg: primaryGreen,
        border: primaryGreen,
        text: '#fff',
        hoverBg: '#00834b',
        hoverBorder: '#00834b',
        hoverText: '#fff',
      },
      gloomy: {
        bg: '#fff',
        border: '#afafaf',
        text: '#5f5f5f',
        hoverBg: '#afafaf',
        hoverBorder: '#afafaf',
        hoverText: '#fff',
      },
      blue: {
        bg: '#fff',
        border: '#4169e1',
        text: '#4169e1',
        hoverBg: '#4169e1',
        hoverBorder: '#4169e1',
        hoverText: '#fff',
      },
    }
  }
};

module.exports = theme;
