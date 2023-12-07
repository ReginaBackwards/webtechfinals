    function dragStart(event) {
        event.dataTransfer.setData("text/plain", event.target.textContent);
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const data = event.dataTransfer.getData("text/plain");

        const newCell = document.createElement("td");
        const newRow = document.createElement("tr");
        newCell.textContent = data;
        newRow.appendChild(newCell);

        const sceneContainer = document.getElementById("sceneContainer").getElementsByTagName("table")[0];
        sceneContainer.appendChild(newRow);
    }

    // document.addEventListener('DOMContentLoaded', function () {
    //     const draggableTds = this.document.querySelectorAll('td[draggable="true"]');

    //     draggableTds.forEach(function (td) {
    //         td.addEventListener('dragStart', dragStart);
    //     });
    // });

    // document.addEventListener('DOMContentLoaded', function() {
    //     const destinationTds = document.querySelectorAll('table');

    //     destinationTds.forEach(function (table) {
    //         table.addEventListener('dragOver', dragOver);
    //         table.addEventListener('drop', drop);
    //     })
    // })
    
    // Fetch resources from the server and update the table
    function fetchResources() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/editor', true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                updateResourceTable(data);
            } else {
                console.error('Fetch error:', xhr.statusText);
            }
        };
        xhr.onerror = function () {
            console.error('Network error during fetch');
        };
        xhr.send();
    }
    
    // Update the resource table with the fetched data
    function updateResourceTable(data) {
        const resourceTableBody = document.getElementById('resourcesContainer');
        resourceTableBody.innerHTML = '';
        
        for (const resource of data) {
            const row = document.createElement('tr');

            row.innerHTML = `
            <tr>
            <td draggable="true">${resource.filename}</td>
            <td draggable="false">${resource.type}</td>
            </tr>
            `;
            resourceTableBody.appendChild(row);
        }
    }
    
    // Initial fetch of resources when the page loads
    fetchResources();