export function drawFig1(container) {
  const width = 1000;
  const height = 500;
  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("#tooltip");

  const originalLabels = {
    "Publication": "Initial sequencing and analysis of the human genome",
    "Authors": "International Human Genome Sequencing Consortium",
    "MeSH Keywords": "MeSH Keywords",
    "Discipline Classification": "Discipline Classification",
    "Topic Classification": "Topic Classification",
    "Region Classification": "Region Classification",
    "Integration Type": "Integration Type"
  };

  const newLabels = {
    "Publication": "文献",
    "Authors": "作者",
    "MeSH Keywords": "关键词",
    "Discipline Classification": "学科分类",
    "Topic Classification": "主题分类",
    "Region Classification": "区域分类",
    "Integration Type": "整合类型"
  };

  const newTooltips = {
    "文献": "这是一个学术文献",
    "作者": "研究文章的作者们",
    "关键词": "医学主题词",
    "学科分类": "对应学科",
    "主题分类": "研究主题",
    "区域分类": "研究涉及的地理区域",
    "整合类型": "不同信息的整合方式"
  };

  let toggled = false;

  const nodes = [
    { id: "Publication", x: 140, y: 240, tooltip: "article" },
    { id: "Authors", x: 360, y: 140 },
    { id: "MeSH Keywords", x: 360, y: 340 },
    { id: "Discipline Classification", x: 600, y: 140 },
    { id: "Topic Classification", x: 600, y: 340 },
    { id: "Region Classification", x: 600, y: 240 },
    { id: "Integration Type", x: 860, y: 240 }
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
    .text("切换文字");

  buttonGroup.on("click", () => {
    toggled = !toggled;
    texts.text(d => {
      const label = toggled ? newLabels[d.id] : originalLabels[d.id];
      d.tooltip = toggled ? newTooltips[label] : d.tooltip;
      return label;
    });
    buttonText.text(toggled ? "切换回英文" : "切换文字");
  });
}
