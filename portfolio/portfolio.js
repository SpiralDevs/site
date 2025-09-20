async function loadProjects() {
    const response = await fetch('projects.json');
    const data = await response.json();
    const container = document.getElementById('portfolio');

    data.projects.forEach(project => {
        const safeId = project.id.replace(/\s+/g, '-');

        const projectDiv = document.createElement('div');
        projectDiv.className = 'project';
        projectDiv.innerHTML = `
            <button class="expand-btn" data-modal="modal-${safeId}">Learn More</button>
            ${project.source ? `<img src="${project.source}" alt="${project.name} Image">` : ''}
            <div class="project-content" id="${safeId}">
                <h2>${project.name}</h2>
                <p>${project.short_description}</p>
            </div>
            <div class="project-buttons">
                ${project.links
                .filter(link => !link.about_section)
                .map(link => `<a href="${link.url}" class="button">${link.text}</a>`)
                .join('')
            }
            </div>
        `;

        container.appendChild(projectDiv);

        // Create modal
        const modalDiv = document.createElement('div');
        modalDiv.id = `modal-${safeId}`;
        modalDiv.className = 'modal';
        modalDiv.innerHTML = `
            <div class="modal-content">
                <button class="close-btn">Close</button>
                <div class="modal-text">
                    <h2>${project.name}</h2>
                    <p>${project.description}</p>
                </div>
                <div class="project-buttons">
                    ${project.links
                .filter(link => link.about_section)
                .map(link => `<a href="${link.url}" class="button">${link.text}</a>`)
                .join('')
            }
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    });

    // Re-run modal listeners
    document.querySelectorAll('.expand-btn').forEach(button => {
        button.addEventListener('click', function () {
            const modal = document.getElementById(this.dataset.modal);
            if (modal) modal.style.display = 'block';
            window.location.hash = this.dataset.modal.replace('modal-', '');
        });
    });

    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
            history.pushState("", document.title, window.location.pathname);
        });
    });

    // Open modal if hash exists
    const hash = window.location.hash.substring(1);
    if (hash) {
        const modalId = 'modal-' + hash.replace(/\s+/g, '-');
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
    }
}

window.addEventListener('DOMContentLoaded', loadProjects);


function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    window.location.hash = modalId.replace('modal-', '');
}

function closeModal(modal) {
    modal.style.display = 'none';
    history.pushState("", document.title, window.location.pathname);
}
document.querySelectorAll('.expand-btn').forEach(button => {
    button.addEventListener('click', function () {
        showModal(this.dataset.modal);
    });
});

document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', function () {
        closeModal(this.parentElement.parentElement);
    });
});

window.addEventListener('load', function () {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const modalId = 'modal-' + hash;
        const modal = document.getElementById(modalId);
        if (modal) {
            showModal(modalId);
        }
    }
});