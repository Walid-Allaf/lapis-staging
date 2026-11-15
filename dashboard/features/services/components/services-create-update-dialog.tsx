import {FormLoading, MainDialog} from '@/dashboard/components'
import {ServicesFormInterface, ServicesOpenCreateUpdateInterface} from '../interfaces'
import {ServicesCreateUpdateForm} from '../components'
import {servicesInitialValues} from '../constants'
import {ServicesSchema} from '../validation'
import {useServicesGetById, useServicesUpdate} from '../hooks'
import {useTranslation} from 'react-i18next'

export default function AddEditDialog({open, onClose}: ServicesOpenCreateUpdateInterface) {
    const {t} = useTranslation()
    const {handleCreate, handleUpdate} = useServicesUpdate()
    const {dataById, isLoadingByID} = useServicesGetById(open.servicesId)
    const isAdd = open.isAdd
    return (
        <MainDialog<ServicesFormInterface>
            open={open.isOpen}
            onClose={onClose}
            isRefetching={isLoadingByID}
            state={isAdd ? 'add' : 'edit'}
            initialValues={
                isAdd
                    ? servicesInitialValues
                    : {
                        nameAr: dataById?.nameAr ?? '',
                        nameEn: dataById?.nameEn ?? '',
                        simpleDescriptionAr: dataById?.simpleDescriptionAr ?? '',
                        simpleDescriptionEn: dataById?.simpleDescriptionEn ?? '',
                        descriptionAr: dataById?.descriptionAr ?? '',
                        descriptionEn: dataById?.descriptionEn ?? '',
                        order: dataById?.order ?? 0,
                        fileId: dataById?.avatar?.id ?? null,
                        isActive: dataById?.isActive ?? true,
                        id: open.servicesId,
                    }
            }
            validationSchema={ServicesSchema}
            handleCreate={(values) =>
                handleCreate({
                    nameAr: values.nameAr,
                    nameEn: values.nameEn,
                    simpleDescriptionAr: values.simpleDescriptionAr,
                    simpleDescriptionEn: values.simpleDescriptionEn,
                    descriptionAr: values.descriptionAr,
                    descriptionEn: values.descriptionEn,
                    order: values.order,
                    fileId: values.fileId,
                    isActive: values.isActive,
                })
            }
            handleUpdate={(values) =>
                handleUpdate({
                    id: open.servicesId,
                    nameAr: values.nameAr,
                    nameEn: values.nameEn,
                    simpleDescriptionAr: values.simpleDescriptionAr,
                    simpleDescriptionEn: values.simpleDescriptionEn,
                    descriptionAr: values.descriptionAr,
                    descriptionEn: values.descriptionEn,
                    order: values.order,
                    fileId: values.fileId,
                    isActive: values.isActive,
                })
            }
            id={!isAdd ? open.servicesId : undefined}
            dialogTitle={isAdd ? t('services_add') : t('services_edit')}
            maxWidth={'3xl'}
        >
            {() => isLoadingByID ?
                <FormLoading/> :
                <ServicesCreateUpdateForm previewUrl={dataById?.avatar?.filePath}/>
            }
        </MainDialog>
    )
}
