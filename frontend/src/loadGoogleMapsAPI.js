 // src/loadGoogleMapsAPI.js
const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve(window.google);
    } else {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDwZUW-iKrQMIFY5SykUl9fK7inZwNA66E&libraries=places';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    }
  });
};

export default loadGoogleMapsAPI;
