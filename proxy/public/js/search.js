export function registerSearchBarFeatures() {
    stopRefreshOnSubmit();
    addClearButton();
    addKeyboardFunctions();
};

function stopRefreshOnSubmit() {
    const form = document.querySelector('#search');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = document.querySelector('#query').value;

        const response = await fetch(`/projects?q=${query}`)
        const data = await response.text()

        const parser = new DOMParser()
        const doc = parser.parseFromString(data, 'text/html')
        const filteredProjects = doc.querySelector('.projects')
        document.querySelector('.projects').replaceWith(filteredProjects)

        form.scrollIntoView()
    });
}

function addClearButton() {
    const input = document.querySelector('#query');
    const clearBtn = document.querySelector('.clear-button')

    input.addEventListener('input', () => {
        clearBtn.style.display = input.value ? 'block' : 'none'
    });

    clearBtn.addEventListener('click', () => {
        input.value = ''
        clearBtn.style.display = 'none'
        input.focus()
    });
}

function addKeyboardFunctions() {
    const form = document.querySelector('#search');
    form.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'Escape':
                form.reset();
                document.querySelector('.clear-button').style.display = 'none';
                break
            case 'Enter':
                e.preventDefault()
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
                break
        };
    });
}