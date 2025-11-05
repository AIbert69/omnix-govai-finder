fetch(`/api/sam?query=${query}`)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("results");
    container.innerHTML = ""; // clear old results

    data.results.forEach(r => {
      const card = document.createElement("div");
      card.className = "result-card";

      card.innerHTML = `
        <h3>${r.title}</h3>
        <p><strong>Agency:</strong> ${r.agency}</p>
        <p><strong>Posted:</strong> ${r.posted}</p>
        <p><strong>Deadline:</strong> ${r.deadline}</p>
        <p><strong>Value:</strong> ${r.value}</p>
        <a href="${r.url}" target="_blank">View Opportunity</a>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error(err);
    document.getElementById("results").innerHTML = "Error loading data.";
  });
