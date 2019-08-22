import Axios from "axios";

export default class HttpCall {
    private url: string;
    private key: string;

    constructor(url: string, key: string) {
        this.url = url;
        this.key = key;
    }

    public async postCall(data) {
        try {
            const response = await Axios.post(this.url, {
                auth: {
                    password: this.key,
                    username: "api",
                },
                data,
                responseType: "json",
            });
            return response.data;
        } catch (error) {
            if (!error.response) {
                throw new Error("InternalServerErrorException");
            }
            // We can throw different error depending error.response.status
            // Although they might be custom error codes and not as below
            switch (error.response.status) {
                case 400: throw new Error("BadRequestException");
                case 401: throw new Error("UnauthorizedException");
                case 403: throw new Error("ForbiddenException");
                case 404: throw new Error("NotFoundException");
                default:
                    throw new Error("InternalServerErrorException");
            }
        }
    }
}
