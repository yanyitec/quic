var Quic;
(function (Quic) {
    var arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
    var propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
    var regt = "\\$\\{(" + arrSectionRegt + "|" + propSectionRegt + ")(" + arrSectionRegt + "|(?:." + propSectionRegt + "))*\\}";
    var regex = new RegExp(regt, "g");
    function createAccess(expr) {
    }
})(Quic || (Quic = {}));
