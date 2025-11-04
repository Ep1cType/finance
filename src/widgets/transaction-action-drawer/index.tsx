import { Button } from "components/ui/button";
import { Drawer, DrawerContent } from "components/ui/drawer";
import { useUnit } from "effector-react/effector-react.umd";
import { Copy, Edit3, Share, Trash2 } from "lucide-react";
import { $drawerState, closeActionDrawer, executeAction } from "../../features/action-on-transaction/store";

export const TransactionActionDrawer = () => {
  const { isOpen, transaction } = useUnit($drawerState);
  const handleClose = useUnit(closeActionDrawer);
  const executeActions = useUnit(executeAction);

  const onDelete = () => {
    executeActions("delete");
  };

  const onEdit = () => {
    executeActions("edit");
  };

  const onShare = () => {};

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="grid gap-3 p-4">
        {/*<DrawerTitle>Title</DrawerTitle>*/}
        {/*<DrawerHeader>Hello</DrawerHeader>*/}
        <Button variant="secondary" onClick={onEdit}>
          <Edit3 className="w-5 h-5 text-slate-600" />
          <span className="text-slate-900 font-medium">Редактировать</span>
        </Button>

        <Button
          variant="secondary"
          // onClick={onDuplicate}
          // className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Copy className="w-5 h-5 text-slate-600" />
          <span className="text-slate-900 font-medium">Дублировать</span>
        </Button>

        <Button variant="secondary" onClick={onShare}>
          <Share className="w-5 h-5 text-slate-600" />
          <span className="text-slate-900 font-medium">Поделиться</span>
        </Button>

        <div className="h-px bg-slate-200 my-2" />

        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="w-5 h-5" />
          <span className="font-medium">Удалить</span>
        </Button>

        <Button variant="outline" onClick={handleClose}>
          Отмена
        </Button>
      </DrawerContent>
    </Drawer>
  );
};
