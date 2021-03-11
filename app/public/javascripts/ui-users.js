const Ui =
{
    filterInputEl: document.getElementById('usernameFilter'),
    clearFilterEl: document.getElementById('clearFilter'),
    filteredUsersEl: document.getElementById('filteredUsers'),
    curPageEl: document.getElementById('currPage'),
    maxPageEl: document.getElementById('maxPage'),
    nextButtonEl: document.getElementById('btn_next'),
    prevButtonEl: document.getElementById('btn_prev'),
    totalUsersEl: document.getElementById('totalUsers'),
    listTemplate: null,

    setTotalUsers(total)
    {
        this.totalUsersEl.innerHTML = total;
    },

    async loadListTemplate()
    {
        const response = await fetch('/templates/users.mst');
        this.listTemplate = await response.text();
    },

    setFilter(filter) { this.filterInputEl.value = filter; },

    setCurPage(page)
    { 
        this.curPageEl.innerHTML = page.toString();
        this.checkPageButtons();
    },

    setMaxPage(maxpPage)
    { 
        this.maxPageEl.innerHTML = maxpPage.toString();
        this.checkPageButtons();
    },

    checkPageButtons()
    {
        if (parseInt(this.curPageEl.innerHTML) === 1)
            this.prevButtonEl.setAttribute("style","visibility:hidden");
        else
            this.prevButtonEl.setAttribute("style","visibility:visible");
        if (parseInt(this.curPageEl.innerHTML) === parseInt(this.maxPageEl.innerHTML))
            this.nextButtonEl.setAttribute("style","visibility:hidden");
        else
            this.nextButtonEl.setAttribute("style","visibility:visible");
    },

    renderUsers(users)
    {
        const template = this.listTemplate;
        const data = { users: users, searchedUsername: this.filterInputEl.value };
        const renderedHTML = Mustache.render(template, data);
        this.filteredUsersEl.innerHTML = renderedHTML;
    },
};