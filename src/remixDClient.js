//const RemixClient = require('@remixproject/plugin-ws')

const services = require('./services');

// Client that connect to Remix IDE (or any IDE that supports remix engine)
//class RemixDClient extends RemixClient {
class RemixDClient {

    // List of methods exposed by the client (required for error checking)
    constructor(services) {
        this.services = services || [];
    }

    register(service) {
        this.services.push(service);
    }

    //Remix sends permissions that user has accepted on frontend
    //For example commandForwarder needs both READ and WRITE permission (list of permission need to be defined)
    //This is possible implementation of isAuthorized
    /*
    git(...commands: string[]) {
    if (this.isAuthorized(this.currentRequest)) {
      this.git(...commands); // managed by the git service.
    }
     */
    validatePermissions(permissions) {
        if(permissions.length === 0){
            return;
        }

        let permissionsEnabled = process.env.PERMISSIONS.split(',');

        permissions.forEach(permission => {
            if(permissionsEnabled.indexOf(permission) === -1){
                throw new Error("Insufficient permissions");
            }
        })
    }

    call(message, send) {
        const {service, fn, args, permissions} = message;
        this.validatePermissions(permissions);
        const func = this.services[service][fn];
        func(args, (error, result) => {
            send({scope: service, fn, error, result});
        });
    }
}

const remixDClient = new RemixDClient(services);
module.exports = remixDClient;