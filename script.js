var tableuViz, d3Viz;
var width = 900;
var height = 900;
var aspect = width / height;
var padding = 20;
var radius = 50;
var activeSheet = 'College'

var data = {
  nodes: [{
      id: 'Arts & Sciences',
      'group': 1
    },
    {
      id: 'Business',
      'group': 2
    },
    {
      id: 'Communication',
      'group': 3
    },
    {
      id: 'Education',
      'group': 4
    },
    {
      id: 'Engineering',
      'group': 5
    },
    {
      id: 'Music',
      'group': 6
    },
    {
      id: 'Public Affairs',
      'group': 7
    },
    {
      id: 'Public Health',
      'group': 1
    }
  ],
  links: [{
      'source': 'Arts & Sciences',
      'target': 'Engineering',
      'value': 1
    },
    {
      'source': 'Education',
      'target': 'Public Health',
      'value': 1
    },
    {
      'source': 'Education',
      'target': 'Music',
      'value': 1
    },
    {
      'source': 'Communication',
      'target': 'Public Health',
      'value': 1
    },
    {
      'source': 'Education',
      'target': 'Business',
      'value': 3
    },
    {
      'source': 'Education',
      'target': 'Public Affairs',
      'value': 2
    },
    {
      'source': 'Education',
      'target': 'Engineering',
      'value': 3
    },
    {
      'source': 'Communication',
      'target': 'Business',
      'value': 5
    }
  ]
}

document.addEventListener('DOMContentLoaded', function() {
  initTableu();
  initD3();
});

function initTableu() {
  var containerDiv = document.getElementById('vizContainer'),
    url = 'http://public.tableau.com/views/RegionalSampleWorkbook/College',
    options = {
      'Academic Year': '',
      hideTabs: true
    };

  tableuViz = new tableau.Viz(containerDiv, url, options);
}

function yearFilter(year) {
  var sheet = viz.getWorkbook().getActiveSheet();
  if (year === '') {
    sheet.clearFilterAsync('Academic Year');
  } else {
    sheet.applyFilterAsync('Academic Year', year, tableau.FilterUpdateType.REPLACE);
  }
}

function initD3() {
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var container = d3.select('#d3container');
  d3Viz = container.append('svg');

  d3Viz.attr('width', width)
    .attr('height', height);

  d3Viz.attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('perserveAspectRatio', 'xMinYMid meet')
    .call(d3resize);

  var clearFilterText = d3Viz.append('text')
    .attr('x', width / 2)
    .attr('y', 50)
    .attr('width', 100)
    .attr('height', 50)
    .attr('class', 'clear-text')
    .on('click', () => clearFilter())
    .text('Clear Filter');

  var simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(function(d) {
      return d.id;
    }))
    .force('collide', d3.forceCollide().radius(radius + padding))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

  var link = d3Viz.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(data.links)
    .enter().append('line')
    .attr('class', 'link')
    .attr('stroke-width', function(d) {
      return Math.sqrt(d.value);
    });


  var node = d3Viz.append('g')
    .attr('class', 'nodes')
    .selectAll('.node')
    .data(data.nodes)
    .enter().append('g')
    .attr('class', 'node')
    .on('mouseover', mouseover)
    .on('mouseout', mouseout)
    .on('click', mouseclick)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  node.append('circle')
    .attr('r', radius)
    .attr('fill', function(d) {
      return color(d.group);
    })

  node.append('text')
    .attr('dx', '0')
    .attr('dy', '0')
    .attr('class', 'node-text')
    .text((d) => {
      return d.id;
    });

  simulation.nodes(data.nodes)
    .on('tick', ticked);

  simulation.force('link')
    .links(data.links);

  function ticked() {
    link
      .attr('x1', function(d) {
        return d.source.x;
      })
      .attr('y1', function(d) {
        return d.source.y;
      })
      .attr('x2', function(d) {
        return d.target.x;
      })
      .attr('y2', function(d) {
        return d.target.y;
      });

    node.
    attr('transform', (d) => {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function mouseover(d) {
    d3.select(this).raise().classed('active', true);
    d3.select(this).selectAll('circle, text').attr('transform', 'scale(1.5,1.5)');
  }

  function mouseout(d) {
    d3.select(this).raise().classed('active', false);
    d3.select(this).selectAll('circle, text').attr('transform', 'scale(1,1)');
  }
  function mouseclick(d){
    applyfilter(d.id)
  }
}


function applyfilter(field) {
  var sheet = tableuViz.getWorkbook().getActiveSheet()
  sheet.applyFilterAsync('College', field,
    tableau.FilterUpdateType.REPLACE);

}

function clearFilter() {
  var sheet = tableuViz.getWorkbook().getActiveSheet()
  sheet.clearFilterAsync('College')
}



function d3resize() {
  var container = d3.select('#d3container');
  var targetWidth = parseInt(container.node().parentNode.clientWidth);
  var targetHeight = parseInt(container.node().parentNode.clientHeight);

  d3Viz.attr('width', targetWidth);
  d3Viz.attr('height', Math.round(targetWidth / aspect));
}
window.addEventListener('resize', d3resize);
