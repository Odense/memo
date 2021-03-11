const data =
{
    lists: [],
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
        Ui.renderLists(this.filteredLists);
    },

    get page()
    {
        return this._page;
    },

    set page(value)
    {
        this._page = value;
        Ui.setCurPage(this.page);
        Ui.renderLists(this.filteredLists);
    },

    get filteredLists()
    {
        const itemsPerPage = 4;
        const filterText = this.titleFilter.trim();
        let filteredLists = [];
        if (!filterText)
            filteredLists = this.lists;
        else
            filteredLists = this.lists.filter(x =>
                x.title.toLowerCase().trim()
                .includes(filterText));
        Ui.setTotalLists("Total lists: " + "" + filteredLists.length);
        let maxPage = parseInt(filteredLists.length / itemsPerPage);
        if (filteredLists.length % itemsPerPage !== 0 || maxPage === 0) {
            ++maxPage;
        }
        Ui.setMaxPage(maxPage);
        const startIndex = (this.page - 1) * itemsPerPage;
        return filteredLists.slice(startIndex, startIndex + itemsPerPage);
    },

    setLists(lists)
    {
        Ui.setCurPage(data.page);
        this.lists = lists;
        Ui.renderLists(this.filteredLists);
    },
};

window.onload = function()
{
    Ui.loadListTemplate();
    fetch("/api/v1/lists").then(x => x.json())
    .then(lists => data.setLists(lists));
};

window.onhashchange = function()
{
    Ui.loadListTemplate();
    fetch("/api/v1/lists").then(x => x.json())
    .then(lists => data.setLists(lists));
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