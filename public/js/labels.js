// Fetch and display existing labels on page load
window.onload = function() {
    fetch('/get-labels')
        .then(response => response.json())
        .then(labels => {
            labels.forEach(label => {
                console.log("label", label)
                // Create a container for each label
                const labelContainer = document.createElement('div');
                labelContainer.className = 'label-box';
                labelContainer.innerHTML = `
                    <p class="tt">${label.description}</p>
                    <canvas id="canvas-${label.id}"></canvas>
                    <i class="edit-icon fas fa-edit"></i>
                `;
                document.querySelector('.page-box').appendChild(labelContainer);

                QRCode.toCanvas(document.getElementById(`canvas-${label.id}`), 'sample text', { width: 100 }, function(error) {
                    if (error) console.error(error);
                    console.log('QR Code generated successfully!');
                });
            });
        })
        .catch(error => console.error('Error fetching labels:', error));
};

// DOMContentLoaded ensures that the DOM is fully loaded before running the code
document.addEventListener("DOMContentLoaded", function() {
    const createLabelBtn = document.getElementById('createLabelBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const createLabelBtnFinal = document.getElementById('createLabelBtnFinal');
    
    // Show the modal and overlay when "Create Label" is clicked
    if (createLabelBtn) {
        createLabelBtn.addEventListener('click', function() {
            resetModal(); // Reset modal state before showing it
            document.getElementById('labelModal').style.display = 'block';
            document.getElementById('modalOverlay').style.display = 'block';  // Show the overlay
        });
    }

    // Close the modal and hide the overlay when "X" is clicked
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            document.getElementById('labelModal').style.display = 'none';
            document.getElementById('modalOverlay').style.display = 'none';  // Hide the overlay
        });
    }

    let currentStep = 1;

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            currentStep++;
            showStep(currentStep);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            currentStep--;
            showStep(currentStep);
        });
    }

    if (createLabelBtnFinal) {
        createLabelBtnFinal.addEventListener('click', handleLabelCreation);
    }
});

function showStep(step) {
    if (step === 1) {
        document.querySelector('.label-options').style.display = 'block';
        document.querySelector('.description-input').style.display = 'none';
        document.querySelector('.file-upload').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('createLabelBtnFinal').style.display = 'none';
    } else if (step === 2) {
        document.querySelector('.label-options').style.display = 'none';
        document.querySelector('.description-input').style.display = 'block';
        document.querySelector('.file-upload').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('prevBtn').style.display = 'block';
        document.getElementById('createLabelBtnFinal').style.display = 'none';
    } else if (step === 3) {
        document.querySelector('.label-options').style.display = 'none';
        document.querySelector('.description-input').style.display = 'none';
        document.querySelector('.file-upload').style.display = 'block';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('prevBtn').style.display = 'block';
        document.getElementById('createLabelBtnFinal').style.display = 'block';
    }
}

function resetModal() {
    currentStep = 1;
    showStep(currentStep);
}

async function handleLabelCreation() {
    const selectedLabel = document.querySelector('input[name="labelType"]:checked');
    if (!selectedLabel) {
        alert("Please select a label type.");
        return;
    }

    const labelType = selectedLabel.value;
    const description = document.getElementById('description').value;
    const fileInput = document.getElementById('fileInput').files[0];

    const formData = new FormData();
    formData.append('labelType', labelType);
    formData.append('description', description);
    if (fileInput) formData.append('file', fileInput);

    try {
        const response = await fetch('/create-label', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.message === 'Label created') {
            document.getElementById('labelModal').style.display = 'none';

            const labelContainer = document.createElement('div');
            labelContainer.className = 'label-box';
            labelContainer.innerHTML = `
                <p>${description}</p>
                <canvas id="canvas-${result.labelId}"></canvas>
            `;
            document.querySelector('.page-box').appendChild(labelContainer);

            QRCode.toCanvas(document.getElementById(`canvas-${result.labelId}`), 'QR Code text', { width: 100 }, function(error) {
                if (error) console.error(error);
                console.log('QR Code generated successfully!');
            });
        } else {
            alert('Error creating label: ' + result.error);
        }
    } catch (error) {
        console.error('Error creating label:', error);
    }
}
