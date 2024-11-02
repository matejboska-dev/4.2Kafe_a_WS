function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const buttons = document.querySelectorAll('.toggle-button');

    sections.forEach(section => {
        section.classList.remove('active');
    });
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
    // Update slider values in real-time
    document.querySelectorAll(".slider").forEach(slider => {
        const valueDisplay = slider.nextElementSibling; 
        slider.addEventListener("input", () => {
            valueDisplay.textContent = slider.value; 
        });
    });

    // Add selected problem to the list

});


document.addEventListener("DOMContentLoaded", () => {
    // Update slider values in real-time

});


const registerButton = document.getElementById('register-button');
const loginButton = document.getElementById('login-button');
const valuesRegister = document.getElementById('values-register');
const valuesLogin = document.getElementById('values-login');

valuesRegister.style.display = 'block';
valuesLogin.style.display = 'none';

function setActiveButton(button) {
    registerButton.classList.remove('active');
    loginButton.classList.remove('active');
    button.classList.add('active');
}

registerButton.addEventListener('click', () => {
    valuesRegister.style.display = 'block';
    valuesLogin.style.display = 'none';
    setActiveButton(register-button); // Set register button as active
});

loginButton.addEventListener('click', () => {
    valuesRegister.style.display = 'none';
    valuesLogin.style.display = 'block';
    setActiveButton(login-button); // Set login button as active
});

document.addEventListener("DOMContentLoaded", () => {
    const problemDropdown = document.getElementById("problem-dropdown");
    const problemList = document.getElementById("problem-list");

    // Function to add a selected problem to the list
    document.querySelector(".problem-submit-button").addEventListener("click", () => {
        const selectedProblem = problemDropdown.value;
        if (selectedProblem) {
            const problemItem = document.createElement("div");
            problemItem.className = "problem-item";
            problemItem.innerHTML = `
                <div>⚠️ ${selectedProblem}</div>
                <div>by User1</div>
            `;
            problemList.appendChild(problemItem);
            problemDropdown.value = ""; // Reset dropdown
        }
    });

    // Update slider values in real-time
    document.querySelectorAll(".slider").forEach(slider => {
        slider.addEventListener("input", function() {
            this.nextElementSibling.textContent = this.value; // Update the adjacent span with slider's value
        });
    });
});
