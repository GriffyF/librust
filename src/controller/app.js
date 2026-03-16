//const { table } = require("node:console");
const link = "https://api.projectlibrus.com";
let cursor = 0;
const limit = 9;
let nextcursor = null;
const cursorstack = [];
document.querySelector("#nextbtn");

async function fetchAPI() {
    const url = `${link}/api/books?cursor=${encodeURIComponent(cursor)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request failed: ${res.status} ${text}`);
    }
    return res.json();
}


async function tablecreate(rows) {
    const hidden = new Set([
        "fld_i_id_pk",
        "fld_i_isbn",
        "fld_i_pages",
        "fld_i_languages",
        "fld_i_year",
        "fld_i_copies",
    ]);
    const catanames = {
        fld_i_title: "Title",
        fld_i_author: "Author",
        fld_i_media: "Medium",

    };

    const books = rows;
    if (!books.length) return;
    const tablehead = document.querySelector("#head");
    const tablebody = document.querySelector("#body");
    tablehead.innerHTML = "";
    tablebody.innerHTML = "";
    const colnames = Object.keys(books[0]).filter(
        col => !hidden.has(col)
    );

    //holdover from last iteration 
    /* const firstrow = tablehead.insertRow();
     colnames.forEach(col => {
         const th = document.createElement("th");
         th.textContent = catanames[col] || col;
         firstrow.appendChild(th);
     });*/
    console.log("books returned:", books.length);
    let row;
    let count = 0;
    books.forEach(book => {
        if (count % 3 == 0) {
            row = tablebody.insertRow();
        }
        const cell = row.insertCell();
        cell.classList.add("book-cell");
        colnames.forEach(col => {
            const spanItem = document.createElement("span")
            spanItem.textContent = book[col];
            spanItem.classList.add("span-cell");
            cell.appendChild(spanItem);
        });
        count = count + 1;
    });

}

async function loadfirst() {
    cursor = 0;
    const data = await fetchAPI();
    tablecreate(data.rows);
    nextcursor = data.nextcursor;
    if (nextbtn) nextbtn.disabled = (nextcursor == null);
}

async function loadnext() {
    if (nextcursor == null) return;
    cursorstack.push(cursor);
    cursor = nextcursor;
    const data = await fetchAPI();
    tablecreate(data.rows);
    nextcursor = data.nextcursor;
    updatebuttons();
}

async function loadprev() {
    if (nextcursor === 0) return;
    cursor = cursorstack.pop();
    const data = await fetchAPI();
    tablecreate(data.rows);
    nextcursor = data.nextcursor;
    updatebuttons();
}
function updatebuttons() {
    if (nextbtn) nextbtn.disabled = (nextcursor == null);
    if (prevbtn) prevbtn.disabled = (cursorstack.length === 0);
}

loadfirst().catch(console.error);

nextbtn.addEventListener("click", () => {
    loadnext().catch(console.error);
});

prevbtn.addEventListener("click", () => {
    loadprev().catch(console.error);
});
//window.addEventListener("DOMContentLoaded", tablecreate);