/**
 * Created by cgcladera on 01/12/13.
 */
/**
 * Created by cgcladera on 01/12/13.
 */
videojs.AudioContext = videojs.CoreObject.extend({
    init: function(){
        try {
            // Fix up for prefixing
            window.AudioContext = window.AudioContext||window.webkitAudioContext;
        }
        catch(e) {
            throw new Error(e);
        }
        this.context = new AudioContext();
        this.gainL = this.context.createGainNode();
        this.gainR = this.context.createGainNode();
        this.gainL.gain.value = 1;
        this.gainR.gain.value = 1;
        this.merger = this.context.createChannelMerger(2);
        this.splitter = this.context.createChannelSplitter(2);
    }
});

videojs.AudioContext.prototype.connect = function (node, output, input){
    //Gets media audio Source Node
    this.source = this.context.createMediaElementSource(node);
    //Connect the source to the splitter
    this.source.connect(this.splitter, 0, 0);
    //Connect splitter' outputs to each Gain Nodes
    this.splitter.connect(this.gainL, 0);
    this.splitter.connect(this.gainR, 1);

    //Connect Left and Right Nodes to the Merger Node inputs
    //Asuming stereo as initial status
    this.gainL.connect(this.merger, 0, 0);
    this.gainR.connect(this.merger, 0, 1);

    //Connect Merger output to context destination
    this.merger.connect(this.context.destination, 0, 0);
};
videojs.AudioContext.prototype.panToLeft = function(){
    this.gainR.disconnect();
    this.gainL.connect(this.merger, 0, 0);
};
videojs.AudioContext.prototype.panToRight = function(){
    this.gainL.disconnect();
    this.gainR.connect(this.merger, 0, 1);
};
videojs.AudioContext.prototype.panToStereo = function(){
    this.gainL.connect(this.merger, 0, 0);
    this.gainR.connect(this.merger, 0, 1);
};

videojs.Player.prototype.panToLeft = function(){
    this.ac.panToLeft();
}
videojs.Player.prototype.panToRight = function(){
    this.ac.panToRight();
};
videojs.Player.prototype.panToStereo = function(){
    this.ac.panToStereo();
};

videojs.plugin('audiopanner', function(options){
    console.log("Audio Panner Init");
    var player = this;
    player.ac = player.ac || videojs.AudioContext.create();

    options = options || {};

    player.ready(function(){
        //TODO: Find the right way to get media element.
        player.ac.connect(player.M);

        //TODO: Find right option key for starting channel
        if(options.starting === 'right'){
            player.panToRight();
        }else {
            player.panToLeft();
        }
    });
});