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
    const data = [
      'UTC',
      'America/Argentina/Buenos_Aires',
      'America/Argentina/Cordoba',
      'America/Argentina/Salta',
      'America/Argentina/Jujuy',
      'America/Argentina/Tucuman',
      'America/Argentina/Catamarca',
      'America/Argentina/La_Rioja',
      'America/Argentina/San_Juan',
      'America/Argentina/Mendoza',
      'America/Argentina/San_Luis',
      'America/Argentina/Rio_Gallegos',
      'America/Argentina/Ushuaia',
      'America/Barbados',
      'America/La_Paz',
      'America/Noronha',
      'America/Belem',
      'America/Fortaleza',
      'America/Recife',
      'America/Araguaina',
      'America/Maceio',
      'America/Bahia',
      'America/Sao_Paulo',
      'America/Campo_Grande',
      'America/Cuiaba',
      'America/Santarem',
      'America/Porto_Velho',
      'America/Boa_Vista',
      'America/Manaus',
      'America/Eirunepe',
      'America/Rio_Branco',
      'America/Nassau',
      'America/Belize',
      'America/St_Johns',
      'America/Halifax',
      'America/Glace_Bay',
      'America/Moncton',
      'America/Goose_Bay',
      'America/Blanc-Sablon',
      'America/Toronto',
      'America/Nipigon',
      'America/Thunder_Bay',
      'America/Iqaluit',
      'America/Pangnirtung',
      'America/Atikokan',
      'America/Winnipeg',
      'America/Rainy_River',
      'America/Resolute',
      'America/Rankin_Inlet',
      'America/Regina',
      'America/Swift_Current',
      'America/Edmonton',
      'America/Cambridge_Bay',
      'America/Yellowknife',
      'America/Inuvik',
      'America/Creston',
      'America/Dawson_Creek',
      'America/Fort_Nelson',
      'America/Vancouver',
      'America/Whitehorse',
      'America/Dawson',
      'America/Santiago',
      'America/Punta_Arenas',
      'America/Bogota',
      'America/Costa_Rica',
      'America/Havana',
      'America/Curacao',
      'America/Santo_Domingo',
      'America/Guayaquil',
      'America/Cayenne',
      'America/Godthab',
      'America/Danmarkshavn',
      'America/Scoresbysund',
      'America/Thule',
      'America/Guatemala',
      'America/Guyana',
      'America/Tegucigalpa',
      'America/Port-au-Prince',
      'America/Jamaica',
      'America/Martinique',
      'America/Mexico_City',
      'America/Cancun',
      'America/Merida',
      'America/Monterrey',
      'America/Matamoros',
      'America/Mazatlan',
      'America/Chihuahua',
      'America/Ojinaga',
      'America/Hermosillo',
      'America/Tijuana',
      'America/Bahia_Banderas',
      'America/Managua',
      'America/Panama',
      'America/Lima',
      'America/Miquelon',
      'America/Puerto_Rico',
      'America/Asuncion',
      'America/Paramaribo',
      'America/El_Salvador',
      'America/Grand_Turk',
      'America/Port_of_Spain',
      'America/New_York',
      'America/Detroit',
      'America/Kentucky/Louisville',
      'America/Kentucky/Monticello',
      'America/Indiana/Indianapolis',
      'America/Indiana/Vincennes',
      'America/Indiana/Winamac',
      'America/Indiana/Marengo',
      'America/Indiana/Petersburg',
      'America/Indiana/Vevay',
      'America/Chicago',
      'America/Indiana/Tell_City',
      'America/Indiana/Knox',
      'America/Menominee',
      'America/North_Dakota/Center',
      'America/North_Dakota/New_Salem',
      'America/North_Dakota/Beulah',
      'America/Denver',
      'America/Boise',
      'America/Phoenix',
      'America/Los_Angeles',
      'America/Anchorage',
      'America/Juneau',
      'America/Sitka',
      'America/Metlakatla',
      'America/Yakutat',
      'America/Nome',
      'America/Adak',
      'America/Montevideo',
      'America/Caracas'
    ];

    if (localStorage.getItem('DATA') === null) {
      localStorage.setItem('DATA', JSON.stringify(data));
      return data;
    }
    
    return JSON.parse(localStorage.getItem('DATA'));
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
  const firstOptionText = 'Select a timezone'; // prevent the event listener for default/first option 
  dropdownUI.addEventListener("change", (event) => {
    event.preventDefault();
    
    if (event.target.value.trim() == firstOptionText) {
      localStorage.clear();
      helper.render();
    }

    // convert the time to selected timezone, store it in localstorage for caching and recall the render method to update timezone UI
    let result = helper.convertTimezone(new Date(), event.target.value);
    localStorage.setItem('CURRENT_TIMEZONE', JSON.stringify({ time: result.toString(), timezone: event.target.value}));
    helper.render();
  });
}




