const form = document.getElementById('vote-form');
var event;

form.addEventListener('submit', e=>{
    
    const choice = document.querySelector('input[name=player]:checked').value;
    const data = {player: choice};

    fetch('http://localhost:3000/poll',{
        method: 'post',
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }).then(res => res.json())
    .catch(err => console.log(err));

//    e.preventDefault();
});

fetch("http://localhost:3000/poll")
    .then(res => res.json())
    .then(data => {
        let votes = data.votes;
        let totalVotes = votes.length;
        document.querySelector('#chartTitle').textContent = `Total Votes: ${totalVotes}`;

        let voteCounts = {
            Sunil: 0,
            Lynn: 0,
            Gayle: 0,
            Rahul: 0
        };

        voteCounts = votes.reduce((acc, vote) => (
            (acc[vote.player] = (acc[vote.player] || 0) + parseInt(vote.points)), acc),
            {}
        );

        let dataPoints = [
            { label: 'Sunil', y: voteCounts.Sunil },
            { label: 'Lynn', y: voteCounts.Lynn },
            { label: 'Gayle', y: voteCounts.Gayle },
            { label: 'Rahul', y: voteCounts.Rahul }
        ];
            
        const chartContainer = document.querySelector('#chartContainer');
        
        if(chartContainer){

            // Listen for the event.
            document.addEventListener('votesAdded', function (e) { 
                document.querySelector('#chartTitle').textContent = `Total Votes: ${e.detail.totalVotes}`;
            });
            
            const chart = new CanvasJS.Chart('chartContainer', {
                animationEnabled: true,
                theme: 'theme1',
                data:[
                    {
                        type: 'column',
                        dataPoints: dataPoints
                    }
                ]
            });
            chart.render();
        
             // Enable pusher logging - don't include this in production
             Pusher.logToConsole = true;
        
             var pusher = new Pusher('355bbcc1238451dd1d93', {
               cluster: 'ap2',
               encrypted: true
             });
         
             var channel = pusher.subscribe('os-poll');

             channel.bind('os-vote', function(data) {
               dataPoints.forEach((point)=>{
                   if(point.label==data.player)
                   {
                        point.y+=data.points;
                        totalVotes+=data.points;
                        event = new CustomEvent('votesAdded',{detail:{totalVotes:totalVotes}});
                        // Dispatch the event.
                        document.dispatchEvent(event);
                   }
               });
               chart.render();
             });
        }

});