# Dual History Project


## Distinctiveness and Complexity

1. Educational Potential and Classroom Use: : Dual History is designed as a purely educational project with vast expansion possibilities. 

2. Curated Database: The project requires a curated database containing year-by-year events for multiple countries, enhancing its accuracy and reliability.

3. Integration of real-world API: Dual History integrates the "REST Countries API," which provides real-world data to enhance the historical content.

4. Mobile Responsive: The website is fully mobile responsive, allowing users to access historical content seamlessly across different devices.

5. Large Codebase: With more than 800 lines of JavaScript and over 250 lines of Python, the project's substantial codebase demonstrates its complexity and functionality.



## File Structure

The project contains the following files and directories:

1. `/csv`: Contains a curated database of year-by-year events for three countries.

2. `/static`: Includes `dual.js` to generate content dynamically and `styles.css` for custom styles.

3. `dual.js`: Handles the dynamic functionality and interactivity of the website. It fetches and populates data from APIs, displays historical events in a table with filtering options, and manages user interactions, such as favoriting events and updating user information. It also displays event details in a modal and handles the addition and removal of events from a user's favorites list. 

4. `/templates`: Contains six templates for different pages of the website.

5. `models.py`: Defines two models - `User` and `Event` - to manage data in the database.

6. `urls.py`: Contains the URL patterns and routing for the application.

7. `views.py`: Serves as the backend server and contains all the server logic, handling data requests from the frontend.

8. `import.py`: Imports csv files into the Django project's database. 


## How to Run the Application

To run the application, follow these steps:

1. In the command line, run `python manage.py runserver`.

2. Open the website in your browser.

3. Select the start year, end year, country A, and country B, and click on 'Discover Parallels.'

4. Explore the resulting table of historical events. Click on any event to read a summary.

5. Logged-in users can add events to favorites from the summary, while all users can read more about an event by clicking 'Read More.'

6. On the profile page, logged-in users can view and manage their favorited events and edit user information.

7. Use the 'Sign In' and 'Register' pages for authentication and access to personalized features.


## Additional Information

Dual History has significant educational potential, as it can accommodate more countries and years, transforming it into an educational and engaging app with a vast historical database.

Educators can utilize the app's functionality for classroom projects. Students can curate historical events for different countries and years, fostering their research and analytical skills. Teachers can then upload this data to the app, presenting the results at science fairs or similar events.

Dual History offers an immersive and enriching historical experience, making it an ideal platform for both learning and exploration.
