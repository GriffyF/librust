//This is for the teacher dashboard 

console.log("app.js loaded");
const link = "https://api.projectlibrus.com";
let cursor = 0;
const limit = 9;
let nextcursor = null;
const cursorstack = [];
const nextbtn = document.querySelector("#nextbtn");
const prevbtn = document.querySelector("#prevbtn");

async function fetchAPI() {
    const url = `${link}/api/teacher/checkedout?cursor=${encodeURIComponent(cursor)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Request failed: ${res.status} ${text}`);
    }
    return res.json();
}

function checkOverdue(rows) {
    const today = new Date();
    const overdue = rows.map(row => {
        if (row.fld_t_returnDate === null) {
            const dueDate = new Date(row.fld_t_dueDate);
            if (dueDate < today) {
                return {
                    ...row,
                    overdue: true

                };
            }
        }
        return {
            ...row,
            overdue: false
        };
    });
    return overdue;
}

function tablecreate(rows){
    const hidden = new Set([
        "fld_t_id_pk",
        "fld_t_duedate",
        "fld_t_returndate",
        "fld_t_userid_fk",
        "fld_t_itemid_fk",
        "overdue"
    ]);
    const catanames = {
        fld_i_title: "Title",
        fld_u_name: "Name",
        fld_t_title: "Title",
        fld_t_checkoutdate: "Checkout Date",

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

    
    let row;
    let count = 0;
    const firstrow = tablehead.insertRow();
    colnames.forEach(col => {
        const th = document.createElement("th");
        th.textContent = catanames[col] || col;
        firstrow.appendChild(th);
    });
    
	books.forEach(book => {
		const row = tablebody.insertRow();
            if(book.overdue === true){
              row.classList.add("table-danger"); 
            }
		colnames.forEach(col => { 
			const cell = row.insertCell();
			let value = book[col];
                if (col.toLowerCase().includes("date") && value) {
                value = value.slice(0, 10);
            }
            cell.textContent = value;
		});
	});	
    
}
async function loadfirst() {
    cursor = 0;
    const data = await fetchAPI();
    tablecreate(checkOverdue(data.rows));
    nextcursor = data.nextcursor;
    if (nextbtn) nextbtn.disabled = (nextcursor == null);
}

async function loadnext() {
    if (nextcursor == null) return;
    cursorstack.push(cursor);
    cursor = nextcursor;
    const data = await fetchAPI();
    tablecreate(checkOverdue(data.rows));
    nextcursor = data.nextcursor;
    updatebuttons();
}

async function loadprev() {
    if (nextcursor === 0) return;
    cursor = cursorstack.pop();
    const data = await fetchAPI();
    tablecreate(checkOverdue(data.rows));
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
