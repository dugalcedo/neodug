declare namespace Express {
    interface Request {
        $title: string
        $originDomain?: string
        $originPath?: string
    }
}