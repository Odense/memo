const data =
{
    users: [],
    _usernameFilter: "",
    _page: 1,

    get usernameFilter()
    {
        return this._usernameFilter.toLowerCase();
    },

    set usernameFilter(value)
    {
        this._usernameFilter = value;
        this._page = 1;
        Ui.setFilter(this.usernameFilter);
        Ui.setCurPage(this.page);
        Ui.renderUsers(this.filteredUsers);
    },

    get page()
    {
        return this._page;
    },

    set page(value)
    {
        this._page = value;
        Ui.setCurPage(this.page);
        Ui.renderUsers(this.filteredUsers);
    },

    get filteredUsers()
    {
        const itemsPerPage = 4;
        const filterText = this.usernameFilter.trim();
        let filteredUsers = [];
        if (!filterText)
            filteredUsers = this.users;
        else
            filteredUsers = this.users.filter(x =>
                x.username.toLowerCase().trim()
                .includes(filterText));
        Ui.setTotalUsers("Total users: " + "" + filteredUsers.length);
        let maxPage = parseInt(filteredUsers.length / itemsPerPage);
        if (filteredUsers.length % itemsPerPage !== 0 || maxPage === 0)
        {
            ++maxPage;
        }
        Ui.setMaxPage(maxPage);
        const startIndex = (this.page - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    },

    setUsers(users)
    {
        Ui.setCurPage(data.page);
        this.users = users;
        Ui.renderUsers(this.filteredUsers);
    },
};

window.onload = function()
{
    Ui.loadListTemplate();
    fetch("/api/v1/users")
    .then(x => x.json())
    .then(users => data.setUsers(users));
};

window.onhashchange = function()
{
    Ui.loadListTemplate();
    fetch("/api/v1/users")
    .then(x => x.json())
    .then(users => data.setUsers(users));
}

Ui.filterInputEl.addEventListener('input', (e) =>
{
    data.usernameFilter = e.target.value;
});

Ui.clearFilterEl.addEventListener('click', () =>
{
    data.usernameFilter = '';
});

Ui.nextButtonEl.addEventListener('click', () =>
{
    data.page += 1;
});

Ui.prevButtonEl.addEventListener('click', () =>
{
    data.page -= 1;
});