var jetpack = require("fs-jetpack")
var jquery = require("jquery")
var path = require("path")

String.format = function() {
  var s = arguments[0]
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm")
    s = s.replace(reg, arguments[i + 1])
  }
  return s
}

$(document).on("dragover drop", function (e) {
    e.preventDefault()
})

var wwiseplug = exports

wwiseplug.get_app_dir = function() {
  return (process.platform === "darwin") ? "/Applications/Audiokinetic/" : "C:/Programs/"
}

wwiseplug.get_rel_plugin_dir = function() {
  if (process.platform === "darwin") {
    return "/Wwise.app/Contents/SharedSupport/Wwise2016/support/wwise/drive_c/Program Files/Audiokinetic/Wwise/Authoring/Win32/Release/bin/plugins"
  } else {
    return "/Authoring/x64/Release/bin/plugins"
  }
}

wwiseplug.get_plugin_dir = function(wwise_version) {
  return this.get_app_dir() + wwise_version + this.get_rel_plugin_dir()
}

wwiseplug.add_plugin = function(plugin_path, wwise_version) {
  if ([".xml", ".dll"].indexOf(path.extname(plugin_path)) >= 0) {
    console.log(String.format("Installing {0} to {1}", path.basename(plugin_path), wwise_version))
    let filename = path.basename(plugin_path, path.extname(plugin_path))
    jetpack.copy(path.dirname(plugin_path), this.get_plugin_dir(wwise_version), {
      matching: [filename + ".xml", filename + ".dll"],
      overwrite: true})
  } else {
    console.error(String.format("{0} not a valid Wwise plugin", plugin_path))
  }
  this.refresh()
}

wwiseplug.remove_plugin = function(plugin_name, wwise_version) {
  if ([".xml", ".dll"].indexOf(path.extname(plugin_name)) >= 0) {
    let plug_dir = this.get_plugin_dir(wwise_version)
    let plug_name = path.basename(plugin_name, path.extname(plugin_name))

    console.log(String.format("Removing {0} from {1}", plugin_name, wwise_version))

    jetpack.remove(path.format({ dir: plug_dir, name: plug_name, ext: ".xml"}))
    jetpack.remove(path.format({ dir: plug_dir, name: plug_name, ext: ".dll"}))

  }
  this.refresh()
}

wwiseplug.refresh = function() {
  let container = $("#wwise")
  container.html("")

  // loop over all wwise application directories
  $.each(jetpack.list(this.get_app_dir()), function (i, dirName) {

    if (~dirName.indexOf("Wwise")) {
      // add wwise version header
      let row = $("<div/>", {class: "row", id: dirName})
      row.append($(String.format("<div class=\"col\"><h3>{0}</h3><hr class=\"wwiseheader\"/></div>", dirName)))

      let drop_area = $("<div/>", {class:"drop-area", id: "droparea-" + dirName})
      // add drag and drop event handlers
      drop_area.bind("drop", (event) => {
        wwiseplug.add_plugin(
            event.originalEvent.dataTransfer.files[0].path, // plugin path
            event.target.id.split("-")[1]) // wwise version
        event.preventDefault()
      })
      drop_area.bind("dragover", (event) => { event.preventDefault() })
      drop_area.bind("dragenter", (event) => { event.target.style.border = "2px dotted #d1e5d5" })
      drop_area.bind("dragleave", (event) => { event.target.style.border = "1px solid #fafafa" })

      let drop_text = $("<div/>", {class:"drop-text", text:"Drop Wwise *.xml or *.dll plugin files here to install."})
      drop_area.append(drop_text)
      row.append(drop_area)

      // construct plugin table
      let table = $("<table/>", {class: "table table-hover"})
      let table_tr = $("<tr/>")
      table_tr.append($("<th>Plugin Name</th>"))
      table_tr.append($("<th>Type</th>"))
      table_tr.append($("<th>Delete</th>"))

      let table_head = $("<thead/>")
      table_head.append(table_tr)
      table.append(table_head)

      let table_body = $("<tbody/>")

      // loop over all installed plugins
      $.each(jetpack.list(wwiseplug.get_plugin_dir(dirName)), function (i, pluginName) {

        if (~pluginName.indexOf("Hv_") && path.extname(pluginName) === ".dll") {
          // create plugin list
          let table_tr = $("<tr/>")
          table_tr.append($(String.format("<td><a>{0}</a></td>", pluginName.split("_")[1])))
          table_tr.append($(String.format("<td>{0}</td>", (~pluginName.indexOf("Source")) ? "Source" : "FX")))

          let delete_link = $("<a/>")
          delete_link.append($("<i/>", {class:"glyphicon glyphicon-trash"}))
          delete_link.bind("click", (event) => {
            wwiseplug.remove_plugin(pluginName, dirName)
          })
          table_tr.append($("<td/>").append(delete_link))
          table_body.append(table_tr)

          // TODO:(joe) check if xml is installed
        }
      })

      // don't display plugin table if it's empty
      if (table_body.html() !== "") {
        table.append(table_body)
        row.append(table)
      }

      // add to the main body
      container.append(row)
    }
  })
}