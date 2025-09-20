function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'block';
    window.location.hash = modalId.replace('modal-', '');
}

function closeModal(modal) {
    if (!modal) return;
    modal.style.display = 'none';
    history.pushState("", document.title, window.location.pathname);
}

function createParagraphsFromHtml(text) {
    // split on <br> tags and trim segments
    return text.split(/<br\s*\/?>/i).map(s => s.trim()).filter(s => s.length > 0);
}

function renderProjects(projects) {
    const container = document.getElementById('portfolio');
    if (!container) return;

    projects.forEach(project => {
        const modalId = 'modal-' + project.id.toLowerCase();

        // Project card
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project';

        if (project.source) {
            const expandBtn = document.createElement('button');
            expandBtn.className = 'expand-btn';
            expandBtn.dataset.modal = modalId;
            expandBtn.textContent = 'Learn More';
            projectDiv.appendChild(expandBtn);

            const img = document.createElement('img');
            img.src = project.source;
            img.alt = project.title || 'Project Image';
            projectDiv.appendChild(img);
        }

        const content = document.createElement('div');
        content.className = 'project-content';
        if (project.id) content.id = project.id;

        const h2 = document.createElement('h2');
        h2.textContent = project.title || '';
        content.appendChild(h2);

        if (project.short_description) {
            const parts = createParagraphsFromHtml(project.short_description);
            parts.forEach(pText => {
                const p = document.createElement('p');
                p.innerHTML = pText;
                content.appendChild(p);
            });
        }

        projectDiv.appendChild(content);

        // Project buttons (only links with about_section === false)
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'project-buttons';
        (project.links || []).filter(l => l.about_section === false).forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.className = 'button';
            a.textContent = link.text;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            buttonsDiv.appendChild(a);
        });
        // Only append if it has children
        if (buttonsDiv.children.length) projectDiv.appendChild(buttonsDiv);

        container.appendChild(projectDiv);

        // Modal (only create if source exists or description exists or links exist)
        const hasModalContent = (project.description && project.description.trim()) || (project.links && project.links.length);
        if (project.source || hasModalContent) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = modalId;

            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.textContent = 'Close';
            modalContent.appendChild(closeBtn);

            const modalText = document.createElement('div');
            modalText.className = 'modal-text';

            const mh2 = document.createElement('h2');
            mh2.textContent = project.title || '';
            modalText.appendChild(mh2);

            if (project.description) {
                const parts = createParagraphsFromHtml(project.description);
                parts.forEach(pText => {
                    const p = document.createElement('p');
                    p.innerHTML = pText;
                    modalText.appendChild(p);
                });
            } else if (project.short_description) {
                // fallback to short description when there's no full description
                const parts = createParagraphsFromHtml(project.short_description);
                parts.forEach(pText => {
                    const p = document.createElement('p');
                    p.innerHTML = pText;
                    modalText.appendChild(p);
                });
            }

            modalContent.appendChild(modalText);

            // Modal buttons: include about_section === true; if none are true include all links
            const modalButtonsDiv = document.createElement('div');
            modalButtonsDiv.className = 'project-buttons';
            const aboutLinks = (project.links || []).filter(l => l.about_section === true);
            const linksToShow = aboutLinks.length ? aboutLinks : (project.links || []);
            linksToShow.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.className = 'button';
                a.textContent = link.text;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                modalButtonsDiv.appendChild(a);
            });
            if (modalButtonsDiv.children.length) modalContent.appendChild(modalButtonsDiv);

            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        }
    });

    // attach event listeners after DOM is created
    document.querySelectorAll('.expand-btn').forEach(button => {
        button.addEventListener('click', function () {
            showModal(this.dataset.modal);
        });
    });

    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', function () {
            // modal is two levels up (modal > modal-content > button)
            const modal = this.parentElement && this.parentElement.parentElement;
            closeModal(modal);
        });
    });
}

window.addEventListener('load', function () {
    fetch('projects.json')
        .then(res => {
            if (!res.ok) throw new Error('Failed to load projects.json');
            return res.json();
        })
        .then(data => {
            renderProjects(data.projects || []);
            // if URL hash present, open modal
            const hash = window.location.hash.substring(1);
            if (hash) {
                const modalId = 'modal-' + hash;
                const modal = document.getElementById(modalId);
                if (modal) showModal(modalId);
            }
        })
        .catch(err => {
            console.error('Error loading projects:', err);
        });
});