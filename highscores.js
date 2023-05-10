function populateHighscoresTable() {
    fetch('https://readme-roulette.onrender.com/snag')
        .then(response => {
            return response.json();
        })
        .then(data => {
            data = data.data;
            // Sort the highscores by score in descending order
            const sortedHighscores = data.sort((a, b) => b.score - a.score);
            // Get the top 10 highscores
            const top10Highscores = sortedHighscores.slice(0, 10);
            // Create an HTML table to display the highscores
            const table = document.createElement('table');
            // Create a caption for the table
            const caption = document.createElement('caption');
            caption.textContent = 'Highscores';
            table.appendChild(caption);
            // Create a header row for the table
            const headerRow = document.createElement('tr');
            const nameHeader = document.createElement('th');
            nameHeader.textContent = 'Name';
            const scoreHeader = document.createElement('th');
            scoreHeader.textContent = 'Score';
            headerRow.appendChild(nameHeader);
            headerRow.appendChild(scoreHeader);
            table.appendChild(headerRow);
            // Create a row for each highscore and add it to the table
            top10Highscores.forEach(highscore => {
                const row = document.createElement('tr');
                const nameCell = document.createElement('td');
                nameCell.textContent = highscore.username;
                const scoreCell = document.createElement('td');
                scoreCell.textContent = highscore.score;
                row.appendChild(nameCell);
                row.appendChild(scoreCell);
                table.appendChild(row);
            });
            // Add the table to the HTML document
            document.getElementById('highscores-table').appendChild(table);
        })
        .catch(error => console.error(error));
}