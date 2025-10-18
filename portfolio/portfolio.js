
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

function htmlToParagraphs(text) {
    if (!text) return [];

    let normalized = String(text).replace(/\r\n|\n/g, '<br>');

    normalized = normalized.replace(/<br\s*\/?>/gi, '<br>');

    const parts = normalized.split(/(?:<br>\s*){2,}/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    return parts;
}


function renderProjects(projects) {
    const container = document.getElementById('portfolio');
    if (!container) return;

    const featured = projects.filter(p => p.tags?.includes("Featured"));
    const regular = projects.filter(p => !p.tags?.includes("Featured"));

    function createProjectCard(project) {
        const modalId = 'modal-' + project.id.toLowerCase();
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

        // ✅ Add tag badges
        if (project.tags?.length) {
            const tagContainer = document.createElement('div');
            tagContainer.className = 'tag-container';
            project.tags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = tag;
                tagContainer.appendChild(tagEl);
            });
            content.appendChild(tagContainer);
        }

        if (project.short_description) {
            const parts = htmlToParagraphs(project.short_description);
            parts.forEach(pHtml => {
                const p = document.createElement('p');
                p.innerHTML = pHtml;
                content.appendChild(p);
            });
        }

        projectDiv.appendChild(content);

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
        if (buttonsDiv.children.length) projectDiv.appendChild(buttonsDiv);

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

            const descSource = project.description || project.short_description || '';
            const descParts = htmlToParagraphs(descSource);
            descParts.forEach(pHtml => {
                const p = document.createElement('p');
                p.innerHTML = pHtml;
                modalText.appendChild(p);
            });

            modalContent.appendChild(modalText);

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

        return projectDiv;
    }

    if (featured.length > 0) {
        const featuredSection = document.createElement('div');
        featuredSection.className = 'featured-section';

        const header = document.createElement('h2');
        header.className = 'featured-header';
        header.textContent = 'Featured Projects';
        featuredSection.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'featured-grid';
        featured.forEach(p => grid.appendChild(createProjectCard(p)));
        featuredSection.appendChild(grid);

        container.appendChild(featuredSection);
    }

    regular.forEach(p => container.appendChild(createProjectCard(p)));

    document.querySelectorAll('.expand-btn').forEach(button => {
        button.addEventListener('click', function () {
            showModal(this.dataset.modal);
        });
    });

    document.querySelectorAll('.close-btn').forEach(button => {
        button.addEventListener('click', function () {
            const modal = this.closest('.modal');
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
