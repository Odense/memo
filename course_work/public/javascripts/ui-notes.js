function CreateModal(id)
{
    let newNode = document.createElement("span");
    newNode.innerHTML = `<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" style="color: orange">Warning!</h3>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>
                <div class="modal-body text-center">
                    <h4>You're going to delete something...</h4>
                    <h4>Are you sure?</h4>
                </div>
                <div class="modal-footer">
                    <form action="/notes/` + id + `" method="POST">
                        <button class="btn btn-danger btn-sm" type="Submit" id="delete">Confirm</button>
                        <input type="hidden" name="listId" value="` + document.getElementById('listId').value + `">
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    document.getElementById("modalCreate").appendChild(newNode);
}

const Ui =
{
    filterInputEl: document.getElementById('titleFilter'),
    clearFilterEl: document.getElementById('clearFilter'),
    filteredNotesEl: document.getElementById('filteredNotes'),
    curPageEl: document.getElementById('currPage'),
    maxPageEl: document.getElementById('maxPage'),
    nextButtonEl: document.getElementById('btn_next'),
    prevButtonEl: document.getElementById('btn_prev'),
    totalNotesEl: document.getElementById('totalNotes'),
    listTemplate: null,

    setTotalNotes(total)
    {
        this.totalNotesEl.innerHTML = total;
    },

    async loadListTemplate()
    {
        const response = await fetch('/templates/notes.mst');
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

    renderNotes(notes)
    {
        const template = this.listTemplate;
        const data = { notes: notes, searchedTitle: this.filterInputEl.value };
        const renderedHTML = Mustache.render(template, data);
        this.filteredNotesEl.innerHTML = renderedHTML;
    },
};