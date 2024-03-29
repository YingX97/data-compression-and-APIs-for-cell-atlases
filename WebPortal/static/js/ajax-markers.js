dataMarker = {};

function generateHmMarkers(result_original,result_scaled,html_element_id,selected_cell, gene_order, showNumMarkers) {
    let useLog = dataMarker['useLog'];

    if (html_element_id === "") {
        html_element_id = "hm_markers";
    }

    if (result_original === '') {
        result_original = dataMarker['result_original']; 
    } else {
        dataMarker['result_original'] = result_original; 
    }

    if (result_scaled === '') {
        result_scaled = dataMarker['result_scaled']; 
    } else {
        dataMarker['result_scaled'] = result_scaled; 
    }

    if (selected_cell === '') {
        selected_cell = dataMarker['selected_cell']; 
    } else {
        dataMarker['selected_cell'] = selected_cell; 
    }

    if (gene_order === '') {
        gene_order = dataMarker['gene_order']; 
    } else {
        dataMarker['gene_order'] = gene_order; 
    }

    //  show the top num markers selected by the user, show all as default
    if (showNumMarkers === "") {
        showNumMarkers = gene_order.length
    }

    let genes = gene_order;
    let celltypes = Object.keys(result_scaled);
    
    // x-axis: cell types
    let x_axis = celltypes;
    // y-axis: genes
    let y_axis = [];
    let y_ticks = [];
    for (var i = showNumMarkers-1; i >= 0; i--) {
        y_axis.push(genes[i]);
        y_ticks.push(`<a href="https://www.genecards.org/cgi-bin/carddisp.pl?gene=${genes[i]}">${genes[i]}</a>`);
    }
    
    let ngenes = y_axis.length;
    let ncelltypes = x_axis.length;
    $("#num_markers").empty();
    $("#num_markers").append(ngenes);

    // let heatmap_width = 1300;
    let heatmap_height = 270 + 20 * ngenes;

    let data_content = [];
    let hover_text = [];
    for (var i = showNumMarkers-1; i >= 0; i--) {
        let each_gene_data = [];
        let temp = [];
        for (var j = 0; j < ncelltypes; j++) {
            let gn = genes[i]
            let ct = celltypes[j];
            let exp_scaled = result_scaled[ct][gn];
            let original_exp = result_original[ct][gn];
            if(useLog) {
                exp_scaled = Math.log10(exp_scaled+0.5);
                original_exp = Math.log10(original_exp+0.5);
            }
            each_gene_data.push(exp_scaled);
            temp.push('Celltype: '+ct+'<br>Gene: '+gn+'<br>Expression in CPM: '+original_exp+'<br>Scaled Expression: '+exp_scaled);
        }
        data_content.push(each_gene_data);
        hover_text.push(temp);
    }

    var data = {
        type: 'heatmap',
        colorscale: 'Reds',
        hoverinfo: 'text'
    };
    var layout = {
        autosize: true, 
        title: 'Heatmap showing expression profile of <b>' + selected_cell +'\'s </b> marker genes',
        xaxis: {
            title: '<b>Cell types<b>',
            automargin: true,
            tickangle: 45
        },
        yaxis: {
            title: '<b>Genes<b>',
            automargin: true,
            autotick: false,
        },
        width: 1000,
        height: heatmap_height,
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
        data['y'] = y_ticks;
        data['text'] = hover_text;
        Plotly.newPlot(document.getElementById(html_element_id), [data],layout,tools);   
    } else {
        data['z'] = [data_content];
        data['x'] = [x_axis];
        data['y'] = [y_ticks];
        data['text'] = [hover_text];

        Plotly.update(document.getElementById(html_element_id), data, layout,tools);
    }
} 

function pagesetup() {

    $.ajax({
        type:'GET',
        url:`${base_url}/all_cell_types`,
        success: function(result) {
            var celltype_categories = Object.keys(result);

            for(var i=0;i<celltype_categories.length;i++) {
                var category = celltype_categories[i];
                $("#celltype_selection").append(`<label class='radio has-text-weight-bold mt-2 has-text-success' disabled>${category}</label><br>`);
                var celltypes = result[category];
                for (var j=0;j<celltypes.length;j++) {
                    $("#celltype_selection").append(`<label class='radio'><input type='radio' name='celltype_selection' value='${celltypes[j]}'/> ${celltypes[j]}</label><br>`);
                }
            }
        },
        error: function (e) {
            alert('Request data fail (no cell types available)')
        }
    });
}

function AjaxMarkers() {

    var selected_cell = $('input[name="celltype_selection"]:checked').val();

    if (selected_cell) {
    // Generate the plot
        $.ajax({
            type:'GET',
            url:`${base_url}/data_markers`,
            data: "celltype=" + selected_cell.replace('+','%2b'),
            success: function(result) {
                $("#hm_markers").empty();
                generateHmMarkers(result['data_original'],result['data_scaled'],'',selected_cell, result['order'], '');
                $("#dp_markers").empty();
                generateDpMarkers(result['data_original'],result['data_scaled'],result['exp_proportion'],'',selected_cell, result['order'], '');
            },
            error: function (e) {
                alert('Request data fail (no cell types available)')
            }
        });
    }
}
$(document).ready(pagesetup)

function clearCheckbox() {
    $('input[name="celltype_selection"]:checked').each(function(){
        $(this).prop('checked', false);
    });
}

$("#clearOnClick").click(clearCheckbox)