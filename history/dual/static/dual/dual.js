document.addEventListener('DOMContentLoaded', function() {
    
  // Get DOM elements
  const startYearSelect = document.getElementById('start-year');
  const endYearSelect = document.getElementById('end-year');
  const countryASelect = document.getElementById('country-a');
  const countryBSelect = document.getElementById('country-b');
  const loadEventsButton = document.getElementById('load-events-btn');
  const eventsTableBody = document.querySelector('#events-table tbody');
  const showEditUser = document.querySelector('#showEditUser');
  const editUser = document.getElementById('editUser');
  const editUserForm = document.getElementById('editUserForm');

  
  //Scroll up button
  const go_up = document.getElementById('go_up');
  go_up.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  

  //Populate list of favorited events on Profile page
  const fav_list = document.getElementById('fav_list');

  if (fav_list) {
    populate_favorites();
  }

  function populate_favorites() {

  fetch('/user_fav_list/')
    .then((response) => {
        return response.json();
    })
    .then((data) => {

      const favoritesJson = data.favorites;
      const favorites = JSON.parse(favoritesJson);

      if (favorites.length > 0) {
        favorites.forEach((favorite) => {
          const li = document.createElement('li');
          li.id = favorite.pk;
          li.textContent = `${favorite.fields.title} (${favorite.fields.country}, ${favorite.fields.year})`;
          li.style.cursor = 'pointer';
          li.classList.add('fav_profile');

          li.addEventListener('click', (event) => {
            const event_id = event.target.id;

            fetch(`/load_single_event/?event_id=${event_id}`)
              .then((response) => {
                  return response.json();
              })
              .then((data) => {
                
                //Show event info in modal
                const event = data.event;  
                showDescription(event);
              })
          });

          fav_list.appendChild(li);
        });

      //If user has no favorites yet, add a <li> "No favorites yet"
      } else {
        const li = document.createElement('li');
        li.textContent = 'No favorites yet.';
        fav_list.appendChild(li);
      }
    })
  }

  //Add event listener to Edit User button on Profile Page
  showEditUser?.addEventListener('click', () => {

    editUser.style.display = 'block';
  });

  const closeEditUser = document.getElementById("dismiss_edit_user");
  if (closeEditUser) {
    closeEditUser.onclick = function(event) {
      event.preventDefault();
      document.getElementById('editUser').style.display = 'none';
    };
  }


  //Add event listener to submission of Edit User form
  editUserForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    // Access form fields and retrieve values
    const nameInput = editUserForm.elements['name'];
    const surnameInput = editUserForm.elements['surname'];
    const usernameInput = editUserForm.elements['username'];
    const emailInput = editUserForm.elements['email'];

    const nameValue = nameInput.value;
    const surnameValue = surnameInput.value;
    const usernameValue = usernameInput.value;
    const emailValue = emailInput.value;


    //Validate input
    if (nameValue === '' || emailValue === '' || usernameValue === '' || surnameValue === '') {
      document.getElementById('alert_edit_user').style.display = 'block';
      document.getElementById('alert_edit_user_txt').textContent = 'Cannot save empty field(s)';
      return
    }

    // Create an object with the form data
    const formData = {
      name: nameValue,
      surname: surnameValue,
      username: usernameValue,
      email: emailValue
    };

    // Send the form data to the backend via a POST request
    fetch('/profile/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then((response) => {
        if (response.ok) {
          
          console.log('User information updated successfully');
          editUser.style.display = 'none';
          location.reload();

        } else {
          console.error('Error updating user information');
        }
      })
  });


  // Fetch form data for the main page
  if (loadEventsButton) {
    getFormData();
  };

  // Attach event listener to perform search of database
  loadEventsButton?.addEventListener('click', loadEvents);

  // Function to fetch form data to populate input select fields (years, countries)
  function getFormData() {
    fetch('/get_form_data/')
        .then((response) => response.json())
        .then((formData) => {
            populateFormOptions(formData);
          })
          
  }

  // Function to populate form input fields (years, countries)
  function populateFormOptions(formData) {
    const earliestYear = formData.earliest_year;
    const latestYear = formData.latest_year;
    const countries = formData.countries;

    // Populate start year and end year select options
    for (let i = earliestYear; i <= latestYear; i++) {
      let option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      startYearSelect.appendChild(option);

      option = document.createElement('option');
      option.value = i;
      option.textContent = i;
      endYearSelect.appendChild(option);
    }

    // Populate country A and country B select options
    countries.forEach((country) => {
      let option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countryASelect.appendChild(option);

      option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countryBSelect.appendChild(option);
    });
  }

  // Function to load events
  function loadEvents() {
    const startYear = startYearSelect.value;
    const endYear = endYearSelect.value;
    const countryA = countryASelect.value;
    const countryB = countryBSelect.value;

    


    // Validate input
    const alert_div = document.getElementById('alert');
    alert_div.style.display = 'none';


    if (startYear === 'Select start year' || endYear === 'Select end year') {
      
      alert_div.textContent = 'Please select years.';
      alert_div.style.display = 'block';
      return;
    }


    if (endYear <= startYear) {
      alert_div.textContent = '';
      alert_div.textContent = 'End Year must be later than Start Year.';
      alert_div.style.display = 'block';

    return;
    }


    if (countryA === 'Select Country A' || countryB === 'Select Country B') {
      
      alert_div.textContent = 'Please choose countries.';
      alert_div.style.display = 'block';
      return;
    }


    if (countryA === countryB) {
      
      alert_div.textContent = '';
      alert_div.textContent = 'Please choose different countries for Country A and Country B.';
      alert_div.style.display = 'block';
      

    return;
    }



    

    window.scrollTo(0, 0);

    fetch(`/load_event/?start_year=${startYear}&end_year=${endYear}&country_a=${countryA}&country_b=${countryB}`)
      .then((response) => response.json())
      .then((eventData) => {
        displayEvents(eventData);
      })
  }

  
  
  // Function to display events in the table
  function displayEvents(eventData) {

    //Clear api_data div
    let api_data = document.getElementById('api_data');
    api_data.innerHTML = '';

    // Generate set of keywords to make the filters for later
    const keywordsSet = new Set();

    // Clear table body and filters
    eventsTableBody.innerHTML = '';
    const filtersDiv = document.getElementById('filters');
    filtersDiv.innerHTML = '';

    // Function to create a table cell with text content
    function createTableCell(text) {
      let cell = document.createElement('td');
      cell.textContent = text;
      return cell;
    }

    // Function to create a table row with the specified cells
    function createTableRow(cells) {
      let row = document.createElement('tr');
      cells.forEach(function(cell) {
        row.appendChild(cell);
      });
      return row;
    }

    let whiteSpace_country = createTableCell('');
    let country_a = createTableCell(countryASelect.value);
    let country_b = createTableCell(countryBSelect.value);

    country_a.classList.add('countries');
    country_a.id = countryASelect.value
    country_b.classList.add('countries');
    country_b.id = countryBSelect.value;

    
    whiteSpace_country.textContent = '';
  
    whiteSpace_country.classList.add('whiteSpace');
    // Create table header row with column names
    let columnNamesRow = createTableRow([

      country_a,
      whiteSpace_country,
      country_b
    ]);

    eventsTableBody.appendChild(columnNamesRow);





    // -------------------Populate div with country's info from API - commented out until design stage----------------------------

    


    country_a = countryASelect.value;
    country_b = countryBSelect.value;

    fetch(`/get_country_data/${country_a}`)
      .then((response) => response.json())
      .then(function(data) {
        
        let country_data = data[0];
        let capital = country_data.capital;
        const capitalName = capital[0];//get name of capital
        const name = country_data.name.official;//get official name
        const country_population = country_data.population; //get country's population

        const country_pop_formatted = country_population.toLocaleString();
        const coat_of_arms = country_data.coatOfArms.png; //get country's coat of arms
        const flag = country_data.flags.png; // get country's flag

        const currency_object = country_data.currencies; 
        const currency_keys = Object.keys(currency_object);
        const currency_name = currency_keys[0]; //Get currency abbreviation
        const currency = country_data.currencies[currency_name].name;




        // Create a div element to hold the country data
        const divElement = document.createElement('div');

        // Add the country data to the div
        divElement.innerHTML = `
          <div class="d-flex flex-column align-items-center justify-content-center mb-2 mx-3">
            <img class="me-2" src="${flag}" alt="Coat of Arms" width='100px' >
          </div>

          <div class="me-2 d-flex flex-column justify-content-center">
            <p class="api_text mb-2">Official name: ${name}</p>
            <p class="api_text mb-2">Capital: ${capitalName}</p>
            <p class="api_text mb-2">Population: ${country_pop_formatted}</p>
            <p class="api_text mb-2">Currency: ${currency_name} - ${currency}</p>
          </div>
          
          
          `;
        divElement.classList.add('api_div');
        divElement.classList.add('d-sm-flex');
        divElement.classList.add('justify-content-center');
        divElement.classList.add('d-block');
        return divElement;

      })
      .then(function(divElement) {
        let api_data = document.getElementById(`${country_a}`);
        
        api_data.appendChild(divElement);

      return fetch(`/get_country_data/${country_b}`);
      })
      .then((response) => response.json())
      .then(function(data) {
        
        let country_data = data[0];
        let capital = country_data.capital;
        const capitalName = capital[0];//get name of capital
        const name = country_data.name.official;//get official name
        const country_population = country_data.population; //get country's population
        const country_pop_formatted = country_population.toLocaleString();
        const coat_of_arms = country_data.coatOfArms.png; //get country's coat of arms
        const flag = country_data.flags.png; // get country's flag

        const currency_object = country_data.currencies; 
        const currency_keys = Object.keys(currency_object);
        const currency_name = currency_keys[0]; //Get currency abbreviation
        const currency = country_data.currencies[currency_name].name;




        // Create a div element to hold the country data
        const divElement = document.createElement('div');

        // Add the country data to the div
        divElement.innerHTML = `
          <div class="d-flex flex-column align-items-center justify-content-center mb-2 mx-3">
            <img class="me-2" src="${flag}" alt="Coat of Arms" width='100px' >
          </div>

          <div class="me-2 d-flex flex-column justify-content-center">
            <p class="api_text mb-2">Official name: ${name}</p>
            <p class="api_text mb-2">Capital: ${capitalName}</p>
            <p class="api_text mb-2">Population: ${country_pop_formatted}</p>
            <p class="api_text mb-2">Currency: ${currency_name} - ${currency}</p>
          </div>
          
          
          `;
        divElement.classList.add('api_div');
        divElement.classList.add('d-sm-flex');
        divElement.classList.add('justify-content-center');
        divElement.classList.add('d-block');
        return divElement;

      })
      .then(function(divElement) {
        let api_data = document.getElementById(`${country_b}`);

        api_data.appendChild(divElement);
      })




    // Form set of distinct years

    let years = [...new Set(eventData.events_a.map(event => event.year))];

    // Iterate over years and create rows for year and event titles
    years.forEach(function(year) {
      // Create a row for the year and merge cells
      let yearRow = createTableRow([]);
      let yearCell = createTableCell(year);
      let arrowYear = document.createElement('div');
      
      yearCell.classList.add('year_cell');
      yearCell.classList.add('pt-4');

      yearCell.setAttribute('colspan', '3');


      yearRow.appendChild(yearCell);
      eventsTableBody.appendChild(yearRow);

      // Create a row for the event titles
      let eventRow = createTableRow([]);
      let eventACell = createTableCell('');
      let whiteSpace = createTableCell('');
      let eventBCell = createTableCell('');

      // Find the events for the year in the iteration
      let eventsA = eventData.events_a.filter(event => event.year === year);
      let eventsB = eventData.events_b.filter(event => event.year === year);

      

      // Choose a random event if multiple events have the same year
      if (eventsA.length > 0) {
        let randomEventA = eventsA[Math.floor(Math.random() * eventsA.length)];
        eventACell.innerHTML = `<div class="event">${randomEventA.title}</div>`;
        whiteSpace.innerHTML = '';

        whiteSpace.classList.add('whiteSpace');
       

        // Create a <div> element to hold the keywords
        let keywordsElement = document.createElement('div');

        const keywordsArray = randomEventA.keywords.split(',');

        


          for (const keyword of keywordsArray) {

            let keywordElement = document.createElement('span');
            keywordElement.textContent = keyword; 

            


            keywordElement.classList.add('keyword');
            keywordElement.classList.add('btn-sm');
            keywordElement.classList.add('btn');
            keywordElement.classList.add('btn-outline-warning');
            keywordElement.classList.add('round_custom');
            keywordElement.classList.add('m-1');

            keywordsElement.appendChild(keywordElement);
              
            
          }
        



        // Append the keywords element to the event cell

        if (keywordsElement.hasChildNodes()) {
          eventACell.appendChild(keywordsElement);
        }




        eventACell.addEventListener('click', function() {
          showDescription(randomEventA);
        });


        



        //Add keywords to the keywords set declared earlier
        if (randomEventA.keywords) {
        let eventKeywordsA = randomEventA.keywords.split(',');

        eventKeywordsA.forEach(function(keyword) {
          yearRow.classList.add(keyword.trim());
          eventRow.classList.add(keyword.trim());
          keywordsSet.add(keyword.trim());
          });
        }   

      }

      if (eventsB.length > 0) {
        let randomEventB = eventsB[Math.floor(Math.random() * eventsB.length)];
        eventBCell.innerHTML = `<div class="event">${randomEventB.title}</div>`;


        // Create a <div> element to hold the keywords
        let keywordsElement = document.createElement('div');


        const keywordsArray = randomEventB.keywords.split(',');
        for (const keyword of keywordsArray) {
          let keywordElement = document.createElement('span');
          keywordElement.textContent = keyword;

          keywordElement.classList.add('keyword');
          keywordElement.classList.add('btn-sm');
          keywordElement.classList.add('btn');
          keywordElement.classList.add('btn-outline-warning');
          keywordElement.classList.add('round_custom');
          keywordElement.classList.add('m-1');



          keywordElement.classList.add('keyword');

          keywordsElement.appendChild(keywordElement);
          keywordsElement.appendChild(document.createTextNode(' '));
        }

        // Append the keywords element to the event cell
        eventBCell.appendChild(keywordsElement);


        eventBCell.addEventListener('click', function() {
                showDescription(randomEventB);
              });

        
        //Add keywords to the keywords set declared earlier
        if (randomEventB.keywords) {
          let eventKeywordsB = randomEventB.keywords.split(',');

          eventKeywordsB.forEach(function(keyword) {
            yearRow.classList.add(keyword.trim());
            eventRow.classList.add(keyword.trim());
            keywordsSet.add(keyword.trim());
            });
          }   
      }

      // Add event cells to the event row

      eventRow.appendChild(eventACell);
      eventRow.appendChild(whiteSpace);
      eventRow.appendChild(eventBCell);

      eventsTableBody.appendChild(eventRow);
    });


    const keywordSpans = document.querySelectorAll('span.keyword');

    keywordSpans.forEach(span => {
      if (span.textContent.trim() === '') {
        span.style.display = 'none';
      }
    });


    // Create checkboxes for each keyword based on populated keywordsSet

    keywordsSet.forEach(function(keyword) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = keyword.trim();
      checkbox.classList.add('keywords-checkbox'); // Add class "keywords-checkbox"
      checkbox.classList.add('btn-check'); // Make checkbox into check button
      
      checkbox.setAttribute('data-keyword', keyword.trim());

      let label = document.createElement('label');
      label.textContent = keyword.charAt(0).toUpperCase() + keyword.slice(1).trim();
      label.htmlFor = keyword.trim();

      // Make checkbox into check button
      label.classList.add('btn'); 
      label.classList.add('btn-outline-warning'); 
      label.classList.add('btn-sm'); 
      label.classList.add('round_custom'); 
      label.classList.add('m-2');

      filtersDiv.prepend(label);
      filtersDiv.prepend(checkbox);
    });

    
    // Add event listener to the checkboxes with class "keywords-checkbox"


    let keywordCheckboxes = filtersDiv.querySelectorAll('.keywords-checkbox');
    


    keywordCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {

      let keyword = this.id;
      let eventRows = eventsTableBody.querySelectorAll('tr:not(:first-child)');


      // Disable all checkboxes except the current one being changed
      keywordCheckboxes.forEach(function(otherCheckbox) {
        if (otherCheckbox !== checkbox) {
          otherCheckbox.disabled = true;
        }
      });

      // Enable all checkboxes if the current checkbox is unchecked
      if (!checkbox.checked) {
        keywordCheckboxes.forEach(function(otherCheckbox) {
          otherCheckbox.disabled = false;
        });
      }



      eventRows.forEach((row) => {
        const hasClass = row.classList.contains(keyword);
        if (checkbox.checked) {
          // Show rows with the specified class
          if (!hasClass) {
            row.style.display = "none";
          }
        } else {
          // Show all rows when checkbox is unchecked
          row.style.display = "";
        }
      });


      });
    });


    // Keywords in the table trigger checkbox to be checked and its event listener triggered

    const keywordsInTable = eventsTableBody.querySelectorAll('.keyword');

    // Add click event listeners to each keyword
    keywordsInTable.forEach((keywordElement) => {
      keywordElement.addEventListener('click', function(event) {
        // Prevent the event from propagating to the cell level
        event.stopPropagation();

        const keyword = this.textContent.trim();
        const checkbox = document.querySelector(`input[data-keyword="${keyword}"]`);

        // Check the associated checkbox if found
        if (checkbox && !checkbox.disabled) {
          checkbox.checked = true;

          // Trigger the 'change' event on the checkbox
          const event = new Event('change', { bubbles: true });
          checkbox.dispatchEvent(event);
        }
      });
    });



  }

});


function showDescription(event) {
  const modal = document.getElementById("eventModal");
  const descriptionElement = document.getElementById("eventDescription");
  const imageElement = document.getElementById("eventImage");
  const linkElement = document.getElementById("eventLink");
  const titleElement = document.getElementById("eventTitle");
  const addToFavoritesButton = document.getElementById("favoriteButton");
  
  
  // Populate description and title
  titleElement.textContent = event.title;
  descriptionElement.textContent = event.description;

  // Populate image if available
  if (event.image) {
    let img = document.createElement("img");
    img.src = event.image;
    imageElement.innerHTML = "";
    imageElement.appendChild(img);
  } else {
    imageElement.innerHTML = "";
  }

  // Populate link if available
  if (event.link) {
    let link = document.createElement("a");
    link.href = event.link;
    link.innerHTML = '<i class="bi bi-eyeglasses me-2"></i>Read more';
    link.target = "_blank"; 
    link.setAttribute('role', 'button');
    link.classList.add('btn'); 
    link.classList.add('btn-dark'); 
    link.classList.add('round_custom'); 
    linkElement.innerHTML = "";
    linkElement.appendChild(link);
  } else {
    linkElement.innerHTML = "";
  }

  // Show the modal

  modal.style.display = "block";
  modal.scrollTo(0,0);
  


  // Close the modal when the 'close' button is clicked
  let closeButton = document.getElementsByClassName("close")[0];
  closeButton.onclick = function() {
    
    modal.style.display = "none";
    document.getElementById('faved_alert').style.display = 'none';


  };

  let closeButtonTwo = document.getElementById("dismiss_modal");
  closeButtonTwo.onclick = function() {
    
    modal.style.display = "none";
    document.getElementById('faved_alert').style.display = 'none';

  };




 

  
  // Add to favorites functionality

  const eventId = event.id;

  if (currentUser.id !== 'None') {
    checkIfFavorited(eventId);  
  };
  

  // Function to check if event is favorited by the user
  function checkIfFavorited(eventId) {
    fetch(`/user_favorites/?event_id=${eventId}`)
      .then((response) => response.json())
      .then(function(data) {
        // Access the 'is_favorited' value from the JSON response
        let isFavorited = data.is_favorited;

        // Set the button's functionality accordingly
        if (isFavorited) {
          addToFavoritesButton.innerHTML = '<i class="bi bi-bookmark-dash me-2"></i>Remove';
          addToFavoritesButton.onclick = function() {
            removeFromFavorites(eventId);
          };
        } else {
          addToFavoritesButton.innerHTML = '<i class="bi bi-bookmark-plus me-2"></i>Add';
          addToFavoritesButton.onclick = function() {
            addToFavorites(eventId);
          };
        }
      })
  }

  
  //Adds event to favorites
  function addToFavorites(eventId) {

    fetch(`/add_to_favs/${eventId}/`, {
      method: 'PUT'
    })
      .then(function(response) {
        if (response.ok) {
          checkIfFavorited(eventId);
          return response.json();
        }
      })
      .then(function(data) {
      
        

        let faved_alert = document.getElementById('faved_alert');
        faved_alert.textContent = 'Event added to favorites.'
        faved_alert.style.display = 'block';

      })
  };


  //Removes events from favorites
  function removeFromFavorites(eventId) {
    fetch(`/remove_from_favs/${eventId}/`, {
      method: 'PUT'
    })
      .then(function(response) {
        if (response.ok) {
          checkIfFavorited(eventId);
          let fav_list = document.getElementById('fav_list');
          if (fav_list) {
            //Reload page to reflect change
            setTimeout(() => {
              location.reload();
            }, 1000); 
          }
          return response.json();
        }
      })
      .then(function(data) {
        // Display success message or update UI accordingly
        let faved_alert = document.getElementById('faved_alert');
        faved_alert.textContent = 'Event removed from favorites.'
        faved_alert.style.display = 'block';

      })
  }
}



