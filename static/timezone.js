function main () {
  
  // Required DOM Elements
  const dropdownUI = document.getElementById('timezone_dropdown');
  const currentTimeUI = document.getElementById('current_time');
  const currentTimezoneUI = document.getElementById('current_timezone');

  // Required variable
  let currentTimezone = null;

  // Required Functions
  function render() {
    if (localStorage.getItem('CURRENT_TIMEZONE') === null) {
      currentTimezoneUI.innerHTML = '';
      currentTimeUI.innerHTML = '';
    }   
    else {
      currentTimezone = JSON.parse(localStorage.getItem('CURRENT_TIMEZONE'));
      currentTimezoneUI.innerHTML = `TimeZone : ${(currentTimezone?.timezone && typeof currentTimezone?.timezone == 'string' && helper.getTimezones().includes(currentTimezone?.timezone)) ? currentTimezone.timezone : ''}`;
      currentTimeUI.innerHTML = `Time : ${currentTimezone?.time ? currentTimezone.time: ''}`;
    }
  }

  function getTimezones() {
    return [
      'Select a timezone',
      'UTC',
      'US/Alaska',
      'US/Aleutian',
      'US/Arizona',
      'US/Central',
      'US/East-Indiana',
      'US/Eastern',
      'US/Hawaii',
      'US/Indiana-Starke',
      'US/Michigan',
      'US/Mountain',
      'US/Pacific',
      'US/Pacific-New',
      'US/Samoa',
    ];
  }

  function convertTimezone(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));   
  }


  function addTimezonesToUI(timezones, currentTimezone) {
    for (let i = 0; i < timezones.length; i++) {
      let option = document.createElement('option');
      
      if (currentTimezone && currentTimezone.timezone == timezones[i]) {
        option.selected = true;
      }

      option.text = timezones[i];
      dropdownUI.append(option);
    }
  }

  // Object containing all the required functions
  const helper = {
    render,
    getTimezones,
    convertTimezone,
    addTimezonesToUI,
  }

  // First call the render function
  helper.render();

  // Get the array of timezones and create a dropdown menu out of it
  const timezones = helper.getTimezones();
  helper.addTimezonesToUI(timezones, currentTimezone);

  // Add eventlistener to dropdown menu
  const firstOptionText = timezones[0]; // prevent the event listener for default/first option 
  dropdownUI.addEventListener("change", (event) => {
    event.preventDefault();
    
    if (event.target.value.trim() == firstOptionText) {
      localStorage.clear();
      helper.render();
    }

    // convert the time to selected timezone, store it in localstorage for caching and recall the render method to update timezone UI
    let result = helper.convertTimezone(new Date(), event.target.value);
    console.log(result);
    localStorage.setItem('CURRENT_TIMEZONE', JSON.stringify({ time: result.toString(), timezone: event.target.value}));
    helper.render();
  });
}




