plotDataUnifiedByCell = {}

function generateHmUnifiedCell(result,html_element_id) {
    // flags passed by events.js
    let useLog = plotDataUnifiedByCell['useLog'];
    let geneOrder = plotDataUnifiedByCell['geneOrder'];
    
    if (result === "") {
        result = plotDataUnifiedByCell['result'];
    } else {
        plotDataUnifiedByCell['result'] = result;
    }

    if (html_element_id === "") {
        html_element_id = "hm_unified_cell";
    }
    let celltype = result['cell_type'];
    
    let genes;
    if (!geneOrder) {
        genes = result['genes'];
    } else {
        genes = result['clustered_gene_order'];
    }
    const expression = result['exp_avg'];
    // x-axis: celltypes
    let x_axis = genes;
    //y-axis: timepoint
    let y_axis = [];
    //z: expression
    let data_content = [];
    //dataset
    let y_axis_dataset = [];
    // timepoint that with duplicate:
    let y_axis_time = [];
    let nGenes = x_axis.length;
    $("#num_genes").empty();
    $("#num_genes").append(nGenes);

    for (var i = 0; i < result['dataset_timepoint'].length; i++) {
        // dataset timepoint combination: e.g TMS_24m
        let dataset_timepoint = result['dataset_timepoint'][i];
        let dataset = dataset_timepoint.split("_")[0];
        let time  = dataset_timepoint.split("_")[1];
        if (y_axis.includes(time)) {
            y_axis.push(time+'\'\'');
        } else {
            y_axis.push(time);
        }
        y_axis_time.push(time);
        y_axis_dataset.push(dataset);
        
        let avgExpAll = [];
        for (var k = 0; k < genes.length; k++) {
            // console.log(dataset_timepoint, genes[k]);
            if (expression[dataset_timepoint][genes[k]] === -1) {
                avgExpAll.push(null);
            } else {
                avgExpAll.push(expression[dataset_timepoint][genes[k]]);
            }
        }
        if (useLog) {
            for (var j = 0; j < avgExpAll.length; j++) {
                if (avgExpAll[j] !== null) {
                    avgExpAll[j] = Math.log10(avgExpAll[j] + 0.5);
                }
            }
        }
        
        data_content.push(avgExpAll);
    }
    // Generate hover text for each spot
    // Celltype: {ct}, Expression: {exp}, Dataset: {ds}, Timepoint: {tp}, 
    let hover_text = [];
    for (var i = 0; i < result['dataset_timepoint'].length; i++) {
        let temp = [];
        for (var j = 0; j < genes.length; j++) {
            let dt = result['dataset_timepoint'][i];
            let gn = result['genes'][j];
            let exp;
            if(useLog && expression[dt][gn] !== null) {
                exp = Math.log10(expression[dt][gn]+0.5);
            } else{
                exp = expression[dt][gn];
            }
            // "ACZ_P21"
            let ds = dt.split("_")[0];
            let tp = dt.split("_")[1];
            temp.push('Gene: '+gn+'<br>Dataset: '+ds+'<br>Timepoint: '+tp+'<br>Expression: '+exp);
        }
        hover_text.push(temp);
    }

    let nTimepoints = y_axis.length;
    var data = {
        type: 'heatmap',
        hoverinfo: 'text',
        colorscale: 'Reds',
    };
    var layout = {
        title: result['cell_type'],
        autosize: false,
        showlegend:false,
        xaxis: {
            title: '<b>Genes<b>',
            automargin: true,
            tickangle: 45,
            scaleanchor: 'y',
            scaleratio: 1,
            type: 'category'
        },
        yaxis: {
            title: '<b>Timepoints<b>',
            automargin: true,
            // scaleanchor: 'x',
            // scaleratio: 1,
            type: 'category'
        },
        width: 1000,
        height: 250+25*nTimepoints,
        hoverongaps: false,
    };
    var tools = {
        modeBarButtonsToAdd: [{
            name: 'Download plot as an SVG',
            icon: Plotly.Icons.camera,
            click: function(gd) {
              Plotly.downloadImage(gd, {format: 'svg'})
            }
          }],
          editable:true,
          responsive: true,
    };

    if ($('#'+html_element_id).text() === "") {
        data['z'] = data_content;
        data['x'] = x_axis;
        data['y'] = y_axis;
        data['text'] = hover_text;
        // console.log(data);
        Plotly.newPlot(document.getElementById(html_element_id), [data], layout,tools);
    } else {
        data['z'] = [data_content];
        data['x'] = [x_axis];
        data['y'] = [y_axis];
        data['text'] = [hover_text];
        Plotly.update(document.getElementById(html_element_id), data, layout,tools);
    }
};

function pagesetupUnified() {
    $.ajax({
        type:'GET',
        url:`${base_url}/all_cell_types`,
        success: function(result) {
            var celltype_categories = Object.keys(result);
            for(var i=0;i<celltype_categories.length;i++) {
                var category = celltype_categories[i];
                $("#celltypeSelection").append(`<option class='has-text-weight-bold mt-2 has-text-success' disabled>${category}</option><br>`);
                var celltypes = result[category];
                for (var j=0;j<celltypes.length;j++) {
                    $("#celltypeSelection").append(`<option value='${celltypes[j]}'>${celltypes[j]}</option>`);
                }
            }
        },
        error: function (e) {
            alert('Request data fail (no cell types available)')
        }
    });
}

$(document).ready(pagesetupUnified)

function AjaxUnifiedCell() {
    // action here when clicking the search button
    let celltype = $("#celltypeSelection option:selected").val();
    let genes = $('#listGenes').val();

    $.ajax({
            type:'GET',
            url:`${base_url}/data_unified_by_cell`,
            data: "celltype=" + celltype + "&genes=" + genes,
            success: function(result) {
                $("#hm_unified_cell").empty();
                generateHmUnifiedCell(result,"hm_unified_cell");
                $("#dp_unified_cell").empty();
                generateDpUnifiedCell(result, "dp_unified_cell");
            },
            error: function (e) {
                Swal.fire('Invalid input', `${e.responseText.substring(1, e.responseText.length - 2)}is invalid, please make sure you type in the correct gene names.`, 'error')
            }
        });
        $("#originalTab").addClass('is-active');
}
