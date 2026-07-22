import ReactGA from "react-ga4";

export const initAnalytics = () => {
  // Replace with your Google Analytics Measurement ID
  ReactGA.initialize("G-XXXXXXXXXX");
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
