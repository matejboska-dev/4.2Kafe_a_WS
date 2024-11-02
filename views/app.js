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
    const addProblemButton = document.getElementById("addProblemButton");
    const problemDropdown = document.getElementById("problemDropdown");
    const problemList = document.getElementById("problemList");

    addProblemButton.addEventListener("click", () => {
        const selectedProblem = problemDropdown.value;
        
        if (selectedProblem) {
            const problemItem = document.createElement("div");
            problemItem.className = "problem-item";
            problemItem.textContent = selectedProblem;
            problemList.appendChild(problemItem);

            // Reset dropdown after adding the problem
            problemDropdown.value = "";
        } else {
            alert("Please select a problem to add.");
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    // Update slider values in real-time
    document.querySelectorAll(".slider").forEach(slider => {
        const valueDisplay = slider.nextElementSibling; // Select the <span> element next to the slider
        slider.addEventListener("input", () => {
            valueDisplay.textContent = slider.value; // Update the <span> with slider's current value
        });
    });
});


const registerButton = document.getElementById('registerButton');
const loginButton = document.getElementById('loginButton');
const valuesRegister = document.getElementById('valuesRegister');
const valuesLogin = document.getElementById('valuesLogin');

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
    setActiveButton(registerButton); // Set register button as active
});

loginButton.addEventListener('click', () => {
    valuesRegister.style.display = 'none';
    valuesLogin.style.display = 'block';
    setActiveButton(loginButton); // Set login button as active
});

document.addEventListener("DOMContentLoaded", () => {
    const problemDropdown = document.getElementById("problemDropdown");
    const problemList = document.getElementById("problemList");

    // Function to add a selected problem to the list
    document.querySelector(".problem-submit-button").addEventListener("click", () => {
        const selectedProblem = problemDropdown.value;
        if (selectedProblem) {
            const problemItem = document.createElement("div");
            problemItem.className = "problem-item";
            problemItem.innerHTML = `
                <span>⚠️ ${selectedProblem}</span>
                <span>by User1</span>
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
