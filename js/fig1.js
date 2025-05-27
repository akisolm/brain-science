export function drawFig1(container) {
  const width = 1000;
  const height = 500;
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("#tooltip");

  const originalLabels = {
    "Publication": "Publication",
    "Authors": "Authors",
    "MeSH Keywords": "MeSH Keywords",
    "Discipline Classification": "Discipline Classification",
    "Topic Classification": "Topic Classification",
    "Region Classification": "Region Classification",
    "Integration Type": "Integration Type"
  };

  const newLabels = {
    "Publication": "<Title (DOI)>",
    "Authors": "N_Authors=257",
    "MeSH Keywords": "<Keywords>",
    "Discipline Classification": "[0 0 1 0 1 1]",
    "Topic Classification": "[0 0 0 2 1 1 1 1 0]",
    "Region Classification": "[7 3 0 1]",
    "Integration Type": "[X X]"
  };

  const newTooltips = {
    "<Title (DOI)>": "Initial sequencing and analysis of the human genome (10.1038/35057062)",
    "N_Authors=257": "International Human Genome Sequencing Consortium",
    "<Keywords>": "Animals, Chromosome Mapping, Conserved Sequence, CpG Islands, DNA Transposable Elements, Databases, Factual...",
    "[0 0 1 0 1 1]": "CIP4=2, CIP5=1, CIP6=1, CIP7=1, CIP8=1",
    "[0 0 0 2 1 1 1 1 0]": "SA3=1, SA5=1, SA6=1",
    "[7 3 0 1]": "KR1=7, KR2=3, KR4=1",
    "[X X]": "Multi-Discipline and Multi-Topic"
  };

  let toggled = false;

  const nodes = [
    { id: "Publication", x: 140, y: 240, tooltip:"<WOS API>" },
    { id: "Authors", x: 360, y: 140, tooltip:"Scientist's Profile <Scopus API>"},
    { id: "MeSH Keywords", x: 360, y: 340, tooltip:"<PubMed API>" },
    { id: "Discipline Classification", x: 600, y: 140, tooltip:"CIP Taxonomy" },
    { id: "Topic Classification", x: 600, y: 340, tooltip:"MeSH Taxonomy" },
    { id: "Region Classification", x: 600, y: 240, tooltip:"Geo Taxonomy" },
    { id: "Integration Type", x: 860, y: 240, tooltip:"M/M X/M M/X X/X" }
  ];

  const links = [
    { source: "Publication", target: "Authors" },
    { source: "Publication", target: "MeSH Keywords" },
    { source: "Authors", target: "Discipline Classification" },
    { source: "MeSH Keywords", target: "Topic Classification" },
    { source: "Authors", target: "Region Classification" },
    { source: "Discipline Classification", target: "Integration Type" },
    { source: "Topic Classification", target: "Integration Type" },
    { source: "Region Classification", target: "Integration Type" }
  ];

  const nodeGroup = svg.append("g").attr("id", "nodes");

  const rects = nodeGroup.selectAll("rect")
    .data(nodes)
    .enter()
    .append("rect")
    .attr("x", d => d.x - 90)
    .attr("y", d => d.y - 35)
    .attr("width", 180)
    .attr("height", 70)
    .attr("fill", "#f0f0f0")
    .attr("stroke", "#333")
    .attr("rx", 6)
    .attr("ry", 6)
    .on("mouseover", function(event, d) {
      if (d.tooltip) tooltip.style("display", "block").text(d.tooltip);
    })
    .on("mousemove", function(event) {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("display", "none");
    });

  const texts = nodeGroup.selectAll("text")
    .data(nodes)
    .enter()
    .append("text")
    .attr("x", d => d.x)
    .attr("y", d => d.y + 5)
    .attr("text-anchor", "middle")
    .style("font-size", "15px")
    .style("font-style", "normal")
    .text(d => d.id);

  svg.selectAll("line")
    .data(links)
    .enter()
    .append("line")
    .attr("x1", d => nodes.find(n => n.id === d.source).x + 90)
    .attr("y1", d => nodes.find(n => n.id === d.source).y)
    .attr("x2", d => nodes.find(n => n.id === d.target).x - 90)
    .attr("y2", d => nodes.find(n => n.id === d.target).y)
    .attr("stroke", "#888")
    .attr("marker-end", "url(#arrow)");

  svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#888");

  // 添加 SVG 按钮
  const buttonGroup = svg.append("g")
    .attr("transform", "translate(40,70)")
    .style("cursor", "pointer");

  buttonGroup.append("rect")
    .attr("width", 100)
    .attr("height", 30)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("fill", "#ffffff")
    .attr("stroke", "#888");

  const buttonText = buttonGroup.append("text")
    .attr("x", 50)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .attr("fill", "#000")
    .text("see Example");

  buttonGroup.on("click", () => {
    toggled = !toggled;
    texts.text(d => {
      const label = toggled ? newLabels[d.id] : originalLabels[d.id];
      d.tooltip = toggled ? newTooltips[label] : d.tooltip;
      return label;
    });
    buttonText.text(toggled ? "see Defination" : "see Example");
  });
}
