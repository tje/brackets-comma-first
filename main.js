define(function (require, exports, module) {
    var AppInit = brackets.getModule('utils/AppInit'),
        DocumentManager = brackets.getModule('document/DocumentManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager');

    prefs = PreferencesManager.getExtensionPrefs('comma-first');
    prefs.definePreference('enabled', 'boolean', false);

    ExtensionUtils.loadStyleSheet(module, 'comma-first.css');

    var $icon;
    AppInit.htmlReady(function () {
        $icon = $('<a id="comma-first-icon" href="#"></a>');
        $icon.toggleClass('on', prefs.get('enabled'));
        $icon.on('click', function () {
            var switchPos = !prefs.get('enabled');
            $(this).toggleClass('on', switchPos);
            prefs.set('enabled', switchPos);
        });
        $icon.appendTo('#main-toolbar .buttons');
    });

    AppInit.appReady(function () {
        var document = DocumentManager.getCurrentDocument(),
            eventKey = 'change.commaFirst',
            bindDoc = function (ev, doc, changeList) {
                if (prefs.get('enabled') === false) return;
                var chg = changeList[0];
                if (chg.from.ch === chg.to.ch && chg.from.line === chg.to.line
                && chg.removed[0] === '' && chg.text[0] === '') {
                    var pos = [
                        { line: chg.from.line, ch: chg.from.ch - 1 },
                        { line: chg.from.line + 1, ch: chg.from.ch }
                    ];
                    var range = doc.getRange(pos[0], pos[1]);
                    var newData = range.replace(/^,\n(\s+)/, '\n$1,').replace(/\s\s,$/, ', ');
                    doc.replaceRange(newData, pos[0], pos[1]);
                }
            };
        $(document).on(eventKey, bindDoc);
        $(DocumentManager).on('currentDocumentChange', function (e, doc, prev) {
            $(prev).off(eventKey);
            document = doc;
            $(document).on(eventKey, bindDoc);
        });
    });
});