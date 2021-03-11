const data =
{
    notes: [],
    _titleFilter: "",
    _page: 1,

    get titleFilter()
    {
        return this._titleFilter.toLowerCase();
    },

    set titleFilter(value)
    {
        this._titleFilter = value;
        this._page = 1;
        Ui.setFilter(this.titleFilter);
        Ui.setCurPage(this.page);
        Ui.renderNotes(this.filteredNotes);
    },

    get page()
    {
        return this._page;
    },

    set page(value)
    {
        this._page = value;
        Ui.setCurPage(this.page);
        Ui.renderNotes(this.filteredNotes);
    },

    get filteredNotes()
    {
        const itemsPerPage = 4;
        const filterText = this.titleFilter.trim();
        let filteredNotes = [];
        if (!filterText)
            filteredNotes = this.notes;
        else
            filteredNotes = this.notes.filter(x =>
                x.title.toLowerCase().trim()
                .includes(filterText));
        Ui.setTotalNotes("Total notes: " + "" + filteredNotes.length);
        let maxPage = parseInt(filteredNotes.length / itemsPerPage);
        if (filteredNotes.length % itemsPerPage !== 0 || maxPage === 0)
        {
            ++maxPage;
        }
        
        Ui.setMaxPage(maxPage);
        const startIndex = (this.page - 1) * itemsPerPage;
        return filteredNotes.slice(startIndex, startIndex + itemsPerPage);
    },

    setNotes(notes)
    {
        Ui.setCurPage(data.page);
        this.notes = notes;
        Ui.renderNotes(this.filteredNotes);
    },
};

window.onload = function()
{
    Ui.loadListTemplate();
    fetch("/api/v1/lists/" + document.getElementById('listId').value).then(x => x.json())
    .then(list => data.setNotes(list.notes));
};

window.onhashchange = function()
{
    Ui.loadListTemplate();
    fetch("/api/v1/lists/" + document.getElementById('listId').value).then(x => x.json())
    .then(list => data.setNotes(list.notes));
}

Ui.filterInputEl.addEventListener('input', (e) =>
{
    data.titleFilter = e.target.value;
});

Ui.clearFilterEl.addEventListener('click', () =>
{
    data.titleFilter = '';
});

Ui.nextButtonEl.addEventListener('click', () =>
{
    data.page += 1;
});

Ui.prevButtonEl.addEventListener('click', () =>
{
    data.page -= 1;
});