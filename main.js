// DOM element references
const createUserForm = document.getElementById('create-user-form');
const prevWeek = document.getElementById('prevWeek');
const nextWeek = document.getElementById('nextWeek');
const dayLabels = document.querySelector('.day-labels');
const hoursContainer = document.querySelector('.hours-container');
let userForm = null; // Store the reference to the user form

// Date and event related variables
let date = new Date();
let events = {};

// Utility function to generate a random string
function getRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Event listener for the calculator form submission
document.getElementById('calculator-form').addEventListener('submit', function(event) {
    event.preventDefault();

    let dailyBudget = parseFloat(document.getElementById('daily-budget').value);
    let hourlyWage = parseFloat(document.getElementById('hourly-wage').value);
    let workHours = parseFloat(document.getElementById('work-hours').value);

    let result = Math.floor(dailyBudget / (hourlyWage * workHours));

    document.getElementById('result').innerHTML = 'A total number of ' + result + ' worker(s), can be afforded today.';
});



// Function to update the calendar display
function updateCalendar() {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Calculate the first and last day of the current week
    const firstDayOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() - 1));
    const lastDayOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (7 - date.getDay()));
    const options = { month: 'long', day: 'numeric' };

    // Update the week range display
    weekRange.textContent = `${firstDayOfWeek.toLocaleDateString(undefined, options)} - ${lastDayOfWeek.toLocaleDateString(undefined, options)}`;

    // Update the day labels
    dayLabels.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const dayLabel = document.createElement('div');
        dayLabel.textContent = weekdays[i].substring(0, 3);
        dayLabels.appendChild(dayLabel);
    }

    // Update the hours display
    hoursContainer.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const hourRow = document.createElement('div');
        hourRow.classList.add('hour-row');
        for (let j = 0; j < 7; j++) {
            const hourCell = document.createElement('div');
            hourCell.classList.add('hour-cell');
            const cellDate = new Date(firstDayOfWeek.getFullYear(), firstDayOfWeek.getMonth(), firstDayOfWeek.getDate() + j, i);
            hourCell.addEventListener('click', () => {
                document.getElementById('event-date').value = cellDate.toISOString().substr(0, 10);
                document.getElementById('event-time').value = cellDate.toISOString().substr(11, 5);
                document.getElementById('event-modal').style.display = 'block';
            });
            const event = events.find(event => event.date.getTime() === cellDate.getTime());
            if (event) {
                hourCell.textContent = event.title;
            }
            hourRow.appendChild(hourCell);
        }
        hoursContainer.appendChild(hourRow);
    }
}

// Function to add a new group to the list
function addGroup(groupName) {
    const li = document.createElement('li');
    li.textContent = groupName;

    // Create an empty user list for the group
    const groupUserList = document.createElement('ul');
    groupUserList.id = `${groupName}-users`;
    li.appendChild(groupUserList); // Append the user list to the group list item

    groupList.appendChild(li);

    // Remove previous user form (if exists)
    if (userForm) {
        groupList.removeChild(userForm);
    }

    // Create a form for adding users and selecting the group
    userForm = document.createElement('form');
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'User Name:';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.required = true;
    const groupLabel = document.createElement('label');
    groupLabel.textContent = 'Group:';
    const groupSelect = document.createElement('select');
    groupSelect.required = true;

    // Create option elements for each group
    const groupOptions = groupList.querySelectorAll('li');
    groupOptions.forEach((groupOption) => {
        const option = document.createElement('option');
        option.value = groupOption.textContent;
        option.textContent = groupOption.textContent;
        groupSelect.appendChild(option);
    });

    const addButton = document.createElement('button');
    addButton.type = 'submit';
    addButton.textContent = 'Add User';

    userForm.appendChild(nameLabel);
    userForm.appendChild(nameInput);
    userForm.appendChild(groupLabel);
    userForm.appendChild(groupSelect);
    userForm.appendChild(addButton);
    groupList.appendChild(userForm);  // Append the form under the group list

    // Event listener for adding users to the group
    userForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent form submission

        const userName = nameInput.value.trim();
        const selectedGroup = groupSelect.value;
        if (userName !== '' && selectedGroup !== '') {
            addUserToGroup(selectedGroup, userName);
            nameInput.value = ''; // Clear the input field
            groupSelect.selectedIndex = 0; // Reset the selected group
        }
    });
}

// Function to add a user to a group
function addUserToGroup(groupName, userName) {
    const groupUserList = document.getElementById(`${groupName}-users`);
    if (groupUserList) {
        const li = document.createElement('li');
        li.textContent = userName;
        groupUserList.appendChild(li); // Append the user to the group's user list
    } else {
        console.error(`Group ${groupName} does not exist.`);
    }
}

// Event listener for the create group form submission
const createGroupForm = document.querySelector('#create-group form');
createGroupForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Get the input value for the group name
    const groupNameInput = document.getElementById('group-name');
    const groupName = groupNameInput.value.trim();

    if (groupName !== '') {
        addGroup(groupName);
        groupNameInput.value = ''; // Clear the input field
    }
});

// Event listener for the previous and next buttons
prevWeek.addEventListener('click', () => {
    date.setDate(date.getDate() - 7);
    updateCalendar();
});

nextWeek.addEventListener('click', () => {
    date.setDate(date.getDate() + 7);
    updateCalendar();
});


// Initial calendar update
updateCalendar();

// Retrieve the group list element
const groupList = document.getElementById('group-list');

