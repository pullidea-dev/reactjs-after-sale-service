import * as React from 'react';
import { Link } from 'react-router-dom';

import { serviceService, authenticationService } from '@/services';
import { Role } from '@/_helpers';

import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    title: {
        textAlign: 'left',
        padding: theme.spacing(5),
    }
}));

function acceptService(serviceId, props) {
    serviceService.updateService(serviceId, authenticationService.currentUserValue.id, authenticationService.currentUserValue.accessToken)
    .then(service => {
        props.history.push("/");
    });
}

function completeService(serviceId, props) {
    serviceService.completeService(serviceId, authenticationService.currentUserValue.accessToken)
    .then(service => {
        props.history.push("/");
    });
}

function ServiceDetailPage(props) {

    const classes = useStyles();
    const { id } = props.match.params;
    const [detail, setDetail] = React.useState();
    const [loading, setLoading] = React.useState(true);
    const [isAdmin, setAdmin] = React.useState(false);
    const [isClient, setClient] = React.useState(false);
    const [isTech, setTech] = React.useState(false);
    const [isAccepted, setAccept] = React.useState(false);
    const [isPending, setPending] = React.useState(false);
    const [isCompleted, setComplete] = React.useState(false);
    const [isOwner, setOwner] = React.useState(false);
    
    React.useEffect(() => {
        serviceService.getOneService(id, authenticationService.currentUserValue.accessToken).then(data => {
            console.log(data);
            setDetail(data);
            setAccept(data.status && data.status.name === "accepted");
            setPending(data.status && data.status.name === "pending");
            setComplete(data.status && data.status.name === "completed");
            setOwner(data.client && data.client._id === authenticationService.currentUserValue.id);
            setLoading(false);
        });
        authenticationService.currentUser.subscribe(x => {
            console.log(x);
            console.log(x && x.roles[0] === Role.Technicien);
            setAdmin(x && x.roles[0] === Role.Admin);
            setClient(x && x.roles[0] === Role.Client);
            setTech(x && x.roles[0] === Role.Technicien);
        });
    }, []);

    console.log("[detail] ", detail);

    return (
        <div>
            {!loading &&
                <div>
                    <h1>{detail.title.toUpperCase()}</h1>
                    <Paper className={classes.paper} justify="flex-start">
                        <Grid container spacing={3}>
                            <Grid item xs={12} className={classes.title}>
                                {detail.description}
                            </Grid>
                            <Grid item xs={4}>Client Name:</Grid>
                            <Grid item xs={8}>{detail.client.username}</Grid>
                            <Grid item xs={4}>Technicien Name:</Grid>
                            <Grid item xs={8}>{detail.technicien ? detail.technicien.username : ''}</Grid>
                            <Grid item xs={4}>Status:</Grid>
                            <Grid item xs={8}>{detail.status.name}</Grid>
                            <Grid item xs={4}>Created Date:</Grid>
                            <Grid item xs={8}>{detail.createdAt}</Grid>
                            <Grid item xs={4}>Updated Date:</Grid>
                            <Grid item xs={8}>{detail.updatedAt}</Grid>
                        </Grid>
                    </Paper>
                    {(isTech && isPending) &&
                        <Button variant="contained" color="primary" onClick={() => acceptService(id, props)}>Accept this Service</Button>
                    }
                    {(isClient && isAccepted && isOwner) &&
                        <Button variant="contained" color="primary" onClick={() => completeService(id, props)}>Complete Service</Button>
                    }
                    {isCompleted && 
                        <div>
                            <h3>Review</h3>
                            <Paper className={classes.paper} justify="flex-start">
                                <Grid item xs={12} className={classes.title}>
                                    {detail.review ? detail.review : 'No Review'}
                                </Grid>
                            </Paper>
                        </div>
                    }
                    {(isClient && isCompleted && isOwner) &&
                        <Link to={"/write_review/" + id} className="btn btn-primary" color="inherit">Write Review</Link>
                        // <Button variant="contained" color="primary" onClick={() => {alert('review')}}>Write Review</Button>
                    }
                </div>
            }
        </div>
    );
}

export {ServiceDetailPage};