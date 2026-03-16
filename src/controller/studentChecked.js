async function fetchData() {
            const tableHead = document.getElementById('head');
            const tableBody = document.getElementById('body');
    		try {
    			const response = await fetch('/api/student/checkedOut');
    			const items = await response.json();

                tableBody.innerHTML = '';
    			
                if (!Array.isArray(items)) {
                    console.error("Expected an array but got:", typeof items);
                    tableBody.innerHTML = `<tr><td colspan="4">Error: Data format is invalid.</td></tr>`;
                    return;
                }

                if (items.length === 0) {
                    tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No books currently checked out.</td></tr>`;
                    return;
                }

                tableHead.innerHTML = `
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Media</th>
                    </tr>
                `

    			tableBody.innerHTML = items.map(item => `
    				<tr>
    					<td>${item.fld_i_title}</td>
    					<td>${item.fld_i_author}</td>
    					<td>${item.fld_i_media}</td>
    				</tr>
    			`).join('');
    			
    		} catch (error) {
    			console.error('Fetch Error:', error);
                tableBody.innerHTML = `<tr><td colspan="3">Could not load dashboard.</td></tr>`;
    		}
    	}
    	
    	fetchData();