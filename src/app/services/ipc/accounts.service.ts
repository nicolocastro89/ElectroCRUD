import { Injectable } from '@angular/core';
import { 
  IPCConnect,
  IPCCheckConnection
} from '../../../shared/ipc/accounts.ipc';
import { ipcRenderer } from 'electron-better-ipc';
import { IAccount } from '../../../shared/interfaces/accounts.interface';
import { LogConsoleService } from '../log-console.service';
import { ConsoleLogItemType } from '../../../shared/interfaces/log-console.interface';

@Injectable({
  providedIn: 'root'
})
export class AccountsIPCService {
  
  constructor(private logConsoleService:LogConsoleService) { }

  public async checkConnection(account: IAccount): Promise<IPCCheckConnection.IResponse> {
    const req: IPCCheckConnection.Request = new IPCCheckConnection.Request({
      server: account.server,
      ssh: account.ssh
    });

    this.logConsoleService.addItem(ConsoleLogItemType.info, JSON.stringify(req.toJsonValue()))

    const rawRes:any = await ipcRenderer.invoke(IPCCheckConnection.CHANNEL, req.toJsonValue());
    console.log("rawRes", rawRes);

    this.logConsoleService.addItem(ConsoleLogItemType.info, JSON.stringify(rawRes))

    return new IPCCheckConnection.Response(rawRes).toMessage()
  }

  public async connect(account: IAccount): Promise<IPCConnect.IResponse> {
    console.log("connect: ", account)
    const req: IPCConnect.Request = new IPCConnect.Request({
      server: account.server,
      ssh: account.ssh
    });
    
    this.logConsoleService.addItem(ConsoleLogItemType.info, JSON.stringify(req.toJsonValue()))

    const rawRes:any = await ipcRenderer.invoke(IPCConnect.CHANNEL, req.toJsonValue());

    this.logConsoleService.addItem(ConsoleLogItemType.info, JSON.stringify(rawRes))
    
    console.log("rawRes", rawRes);
    return new IPCConnect.Response(rawRes).toMessage()
  }

}
